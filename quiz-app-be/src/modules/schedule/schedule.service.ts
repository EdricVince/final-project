import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { GenerateScheduleDto, StudyPlan, MonthPlan, WeekSummary, DaySchedule } from './dto/schedule.dto';

const MONTHS_BY_LEVEL: Record<string, Record<string, number>> = {
  beginner: { IELTS: 12, TOEIC: 10, TOEFL: 12, General: 8 },
  A1:       { IELTS: 10, TOEIC: 8,  TOEFL: 10, General: 6 },
  A2:       { IELTS: 8,  TOEIC: 6,  TOEFL: 8,  General: 5 },
  B1:       { IELTS: 5,  TOEIC: 4,  TOEFL: 5,  General: 3 },
  B2:       { IELTS: 3,  TOEIC: 2,  TOEFL: 4,  General: 2 },
  C1:       { IELTS: 2,  TOEIC: 1,  TOEFL: 2,  General: 1 },
  C2:       { IELTS: 1,  TOEIC: 1,  TOEFL: 1,  General: 1 },
};

function getMonthsNeeded(level: string, exam: string, targetBand?: string, weeklyHours: number = 10): number {
  const base = MONTHS_BY_LEVEL[level]?.[exam] ?? 6;
  let months = base;

  if (targetBand) {
    const bandNum = parseFloat(targetBand);
    if (exam === 'IELTS') {
      if (bandNum >= 8.0) months = Math.ceil(months * 1.4);
      else if (bandNum >= 7.0) months = Math.ceil(months * 1.2);
      else if (bandNum <= 5.0) months = Math.ceil(months * 0.85);
    } else if (exam === 'TOEIC') {
      if (bandNum >= 900) months = Math.ceil(months * 1.3);
      else if (bandNum >= 800) months = Math.ceil(months * 1.1);
      else if (bandNum <= 500) months = Math.ceil(months * 0.8);
    }
  }

  // Fewer hours/week → more months needed. 10h/week is the baseline reference.
  const hoursMultiplier = 10 / Math.max(weeklyHours, 2);
  months = Math.round(months * hoursMultiplier);

  return Math.min(Math.max(months, 1), 36);
}

// Tier 1: beginner/A1/A2 or IELTS target <5 — slow, one skill per day
// Tier 2: B1/B2 or IELTS 5-6.5 — medium, one main skill per day
// Tier 3: C1/C2 or IELTS 7+ — professional, framework approach
function getTier(level: string, exam: string, targetBand?: string): 1 | 2 | 3 {
  if (level === 'C1' || level === 'C2') return 3;
  if (exam === 'IELTS' && targetBand && parseFloat(targetBand) >= 7.0) return 3;
  if (exam === 'TOEIC' && targetBand && parseFloat(targetBand) >= 800) return 3;
  if (level === 'B1' || level === 'B2') return 2;
  if (exam === 'IELTS' && targetBand && parseFloat(targetBand) >= 5.0) return 2;
  if (exam === 'TOEIC' && targetBand && parseFloat(targetBand) >= 500) return 2;
  return 1;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function makeDay(day: string, skill: string, topic: string, isRest: boolean): DaySchedule {
  return { day, skill, topic, is_rest: isRest };
}
function restDay(day: string): DaySchedule {
  return { day, skill: 'Rest', topic: 'Rest & consolidation — brain builds memory during recovery', is_rest: true };
}

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  private readonly client: Anthropic | null;

  constructor(private config: ConfigService) {
    const key = this.config.get<string>('ANTHROPIC_API_KEY');
    this.client = key && key !== 'your-anthropic-api-key-here' ? new Anthropic({ apiKey: key }) : null;
  }

  async generatePlan(dto: GenerateScheduleDto): Promise<StudyPlan> {
    if (!this.client) return this.getFallbackPlan(dto);

    const monthsNeeded = getMonthsNeeded(dto.current_level, dto.target_exam, dto.target_band, dto.weekly_hours);
    const tier = getTier(dto.current_level, dto.target_exam, dto.target_band);
    const monthlyHours = dto.weekly_hours * 4;
    const previewMonths = Math.min(monthsNeeded, 6);
    const prompt = this.buildPrompt(dto, monthsNeeded, monthlyHours, previewMonths, tier);

    try {
      const res = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 7000,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = (res.content[0] as { text: string }).text.trim().replace(/```json\n?|```/g, '').trim();
      const plan: StudyPlan = JSON.parse(text);
      return plan;
    } catch (e) {
      this.logger.error('Schedule AI failed', e);
      return this.getFallbackPlan(dto);
    }
  }

  private buildPrompt(dto: GenerateScheduleDto, monthsNeeded: number, monthlyHours: number, previewMonths: number, tier: 1 | 2 | 3): string {
    const targetStr = dto.target_band ? `${dto.target_exam} ${dto.target_band}` : dto.target_exam;
    const tierGuide = tier === 1
      ? `TIER 1 — BEGINNER (${dto.current_level}): Each day focuses on EXACTLY ONE skill only. Never mix skills. Simple topics. Build habits first. Rotation: Mon=Vocabulary, Tue=Grammar, Wed=Reading, Thu=Listening, Fri=Writing, Sat=Speaking, Sun=Rest. Keep topics very accessible and motivating.`
      : tier === 2
      ? `TIER 2 — INTERMEDIATE (${dto.current_level}): One main skill per day. Topics are moderate to advanced. Progress must be clearly visible each week. Connect skills across the week.`
      : `TIER 3 — PROFESSIONAL (${dto.current_level}): High-level monthly objectives. Students self-direct with guidance. Focus on refinement and exam strategy. Framework-based, not prescriptive.`;

    return `You are an expert ${dto.target_exam} tutor. Create a personalized monthly study plan.

STUDENT PROFILE:
- Level: ${dto.current_level} → Target: ${targetStr}
- Weekly hours: ${dto.weekly_hours}h/week (≈${monthlyHours}h/month)
- Total months needed: ${monthsNeeded}
- ${dto.focus_areas?.length ? 'Priority skills: ' + dto.focus_areas.join(', ') : 'All skills equally'}

${tierGuide}

Generate the first ${previewMonths} month(s) in detail.

Return ONLY valid JSON:
{
  "level": "${dto.current_level}",
  "target": "${targetStr}",
  "months_needed": ${monthsNeeded},
  "monthly_plan": [
    {
      "month": 1,
      "theme": "Foundation & Core Vocabulary",
      "objective": "Build 100+ academic words and establish daily study habit",
      "total_hours": ${monthlyHours},
      "week_summaries": [
        {
          "week_in_month": 1,
          "focus": "IELTS Overview & Basic Vocabulary",
          "daily_schedule": [
            { "day": "Mon", "skill": "Vocabulary", "topic": "Academic Word List Set 1 — 20 words with sentences", "is_rest": false },
            { "day": "Tue", "skill": "Grammar", "topic": "Present Simple & Continuous — rules + 15 exercises", "is_rest": false },
            { "day": "Wed", "skill": "Reading", "topic": "IELTS Reading format overview + 1 short passage", "is_rest": false },
            { "day": "Thu", "skill": "Listening", "topic": "IELTS Section 1: form filling practice", "is_rest": false },
            { "day": "Fri", "skill": "Writing", "topic": "Task 1 overview: bar chart introduction template", "is_rest": false },
            { "day": "Sat", "skill": "Speaking", "topic": "Part 1: introduce yourself + 5 personal questions", "is_rest": false },
            { "day": "Sun", "skill": "Rest", "topic": "Rest & consolidation day", "is_rest": true }
          ]
        }
      ]
    }
  ],
  "tips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "resources": [
    { "name": "name", "type": "book|website|app|podcast", "description": "description" }
  ]
}

Rules:
- Each month must have exactly 4 week_summaries
- Each week_summary must have exactly 7 daily_schedule entries (Mon-Sun)
- Sunday is always is_rest: true
- Topics must be specific and actionable, not vague
- Progress must increase in difficulty each month`;
  }

  private getFallbackPlan(dto: GenerateScheduleDto): StudyPlan {
    const tier = getTier(dto.current_level, dto.target_exam, dto.target_band);
    const monthsNeeded = getMonthsNeeded(dto.current_level, dto.target_exam, dto.target_band, dto.weekly_hours);
    const monthlyHours = dto.weekly_hours * 4;
    const target = dto.target_band ? `${dto.target_exam} ${dto.target_band}` : dto.target_exam;

    let monthly_plan: MonthPlan[];
    if (tier === 1) monthly_plan = this.tier1Plan(dto, monthsNeeded, monthlyHours);
    else if (tier === 2) monthly_plan = this.tier2Plan(dto, monthsNeeded, monthlyHours);
    else monthly_plan = this.tier3Plan(dto, monthsNeeded, monthlyHours);

    return {
      level: dto.current_level,
      target,
      months_needed: monthsNeeded,
      monthly_plan,
      tips: this.buildTips(dto, tier, monthsNeeded),
      resources: this.getResources(dto.target_exam),
    };
  }

  // ─── TIER 1: Beginner / A1 / A2 ────────────────────────────────────────────
  // One skill per day — Mon=Vocabulary, Tue=Grammar, Wed=Reading,
  // Thu=Listening, Fri=Writing, Sat=Speaking, Sun=Rest
  private tier1Plan(dto: GenerateScheduleDto, monthsNeeded: number, monthlyHours: number): MonthPlan[] {
    const ex = dto.target_exam;
    const months: MonthPlan[] = [
      {
        month: 1, theme: 'Foundation & First Steps', total_hours: monthlyHours,
        objective: 'Understand the exam format, build 80 core vocabulary words, and establish a daily study routine',
        week_summaries: [
          {
            week_in_month: 1, focus: 'Exam Overview — What am I preparing for?',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', `Core word families: 20 essential ${ex} words (analyse, develop, identify, compare, describe)`, false),
              makeDay('Tue', 'Grammar', 'Present Simple & Present Continuous — rules, 15 gap-fill exercises, form sentences', false),
              makeDay('Wed', 'Reading', `${ex} Reading format: question types overview + read 1 short passage (150 words) for main idea`, false),
              makeDay('Thu', 'Listening', `${ex} Listening format + Section 1 introduction: form-filling with names, numbers, dates`, false),
              makeDay('Fri', 'Writing', `${ex} Writing overview: Task 1 and Task 2 explained with 2 sample answers side by side`, false),
              makeDay('Sat', 'Speaking', `${ex} Speaking format: Parts 1-3 explained + introduce yourself clearly for 2 minutes`, false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 2, focus: 'First Skill Practice — Try Each Skill Once',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', 'Topic: People & Relationships — 20 words (colleague, community, relationship, partner, society)', false),
              makeDay('Tue', 'Grammar', 'Simple Past & Past Continuous — rules + 15 fill-in exercises, make 5 sentences about your week', false),
              makeDay('Wed', 'Reading', 'Skimming technique: find main idea of 2 texts (200 words each) in 2 minutes — no reading every word', false),
              makeDay('Thu', 'Listening', 'Listening for specific info: numbers, names, addresses — 2 short recordings, fill in blanks', false),
              makeDay('Fri', 'Writing', 'Task 1: how to start a bar chart description — template + 3 example opening sentences', false),
              makeDay('Sat', 'Speaking', 'Part 1 practice: 5 common personal questions (family, hometown, job) — answer in 2-3 sentences', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 3, focus: 'Building Vocabulary & Routine',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', 'Topic: Health & Lifestyle — 20 words (obesity, nutrition, wellbeing, diagnosis, symptom)', false),
              makeDay('Tue', 'Grammar', 'Future forms: will, going to, Present Continuous for future — 3 rules + 10 exercises', false),
              makeDay('Wed', 'Reading', 'T/F/NG strategy: locate keyword → check exact meaning → 5 practice questions (first attempt)', false),
              makeDay('Thu', 'Listening', 'Section 1 full practice: booking/registration dialogue, 10 questions, timed', false),
              makeDay('Fri', 'Writing', 'Task 1 trend language: increase, decrease, peak, level off, fluctuate — write 5 sentences with data', false),
              makeDay('Sat', 'Speaking', 'Part 2 cue card: Describe a place you have visited — prepare 1 min, speak 1-2 minutes', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 4, focus: 'Monthly Review & Confidence Check',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', 'Review all Month 1 words (60 words) with flashcards + 10 new words on topic: Environment', false),
              makeDay('Tue', 'Grammar', 'Modal verbs: can, could, should, must, might — meaning + 10 sentences + quiz', false),
              makeDay('Wed', 'Reading', 'T/F/NG: 10 questions on a 300-word passage — answer then review each carefully', false),
              makeDay('Thu', 'Listening', 'Section 2 introduction: tour guide / public announcement — 1 full practice', false),
              makeDay('Fri', 'Writing', 'Task 1: write 1 complete bar chart response (minimum 150 words) — first full attempt', false),
              makeDay('Sat', 'Speaking', 'Speaking drill: 10 Part 1 questions back-to-back — focus on not pausing too long', false),
              restDay('Sun'),
            ],
          },
        ],
      },
      {
        month: 2, theme: 'Building Core Skills', total_hours: monthlyHours,
        objective: 'Practice each skill independently with more challenging material — 40 new words, full Section 1+2 listening',
        week_summaries: [
          {
            week_in_month: 1, focus: 'Expanding Vocabulary & Grammar Accuracy',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', 'Topic: Environment & Climate — 25 words (pollution, sustainability, renewable, emission, habitat)', false),
              makeDay('Tue', 'Grammar', 'Present Perfect: have/has + past participle — form rules + difference from Simple Past (15 exercises)', false),
              makeDay('Wed', 'Reading', 'Note completion: choose ONE WORD from passage — 10 questions, locate then verify', false),
              makeDay('Thu', 'Listening', 'Section 2: guided tour + map/directions exercise — label diagram while listening', false),
              makeDay('Fri', 'Writing', 'Task 1: process diagrams — sequence words (first, then, subsequently, finally) + 1 example', false),
              makeDay('Sat', 'Speaking', 'Part 2 extended: 3 different cue cards, speak 1-2 min each — record yourself and listen back', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 2, focus: 'Reading Strategies & Listening Depth',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', 'Topic: Education & Learning — 25 words (curriculum, assessment, scholarship, achievement, tuition)', false),
              makeDay('Tue', 'Grammar', 'Passive voice: active → passive transformation — 20 business/academic sentences', false),
              makeDay('Wed', 'Reading', 'Multiple choice: eliminate 3 wrong options strategy + 10 practice questions on 1 passage', false),
              makeDay('Thu', 'Listening', 'Section 3: academic discussion between 2 students — note-taking + 8 questions', false),
              makeDay('Fri', 'Writing', 'Task 2 overview: 4 essay types (opinion, discussion, advantages/disadvantages, problem-solution)', false),
              makeDay('Sat', 'Speaking', 'Part 3: abstract questions on Education — give opinion + reason + example (2-3 sentences each)', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 3, focus: 'Technology & Society Topics',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', 'Topic: Technology & Society — 25 words (innovation, automation, digital, algorithm, artificial)', false),
              makeDay('Tue', 'Grammar', 'Relative clauses: defining (who, which, that) + non-defining (, who, , which) — 15 sentences', false),
              makeDay('Wed', 'Reading', 'Matching headings to paragraphs: identify paragraph topic + match to heading — 8 questions', false),
              makeDay('Thu', 'Listening', 'Section 4: academic lecture extract — note-taking + 10 fill-in questions, one listening only', false),
              makeDay('Fri', 'Writing', 'Task 2 body paragraph: PEEL structure (Point → Evidence → Explanation → Link) + 1 example', false),
              makeDay('Sat', 'Speaking', 'Part 1 advanced: give opinions on technology — extend with "because" and "for example"', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 4, focus: 'Integration: Full Skill Practice',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', 'Topic: Work & Economy — 25 words (unemployment, productivity, remote, collaboration, enterprise)', false),
              makeDay('Tue', 'Grammar', '1st Conditional: if + present → will — 20 exercises + 5 original sentences', false),
              makeDay('Wed', 'Reading', 'Full passage 400 words: T/F/NG + Note completion combined — 12 questions, 20 minutes', false),
              makeDay('Thu', 'Listening', 'Sections 1 + 2 back-to-back: timed 18 minutes — simulate exam conditions', false),
              makeDay('Fri', 'Writing', 'Task 2: write full introduction + body paragraph 1 — strong thesis + 1 clear argument', false),
              makeDay('Sat', 'Speaking', 'Mock Part 1+2+3 mini interview: one topic — 8 minutes total — record and review', false),
              restDay('Sun'),
            ],
          },
        ],
      },
      {
        month: 3, theme: 'Skill Development & First Mock Tests', total_hours: monthlyHours,
        objective: 'Master all question types, write complete Task 1+2 responses, complete first full mock test section',
        week_summaries: [
          {
            week_in_month: 1, focus: 'Advanced Vocabulary & Complex Grammar',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', 'Academic collocations: conduct research, draw conclusions, provide evidence, significant impact (30 phrases)', false),
              makeDay('Tue', 'Grammar', '2nd Conditional: if + past → would — hypothetical situations + 20 exercises', false),
              makeDay('Wed', 'Reading', 'T/F/NG + Note completion combined on 450-word passage: 14 questions, 25 minutes', false),
              makeDay('Thu', 'Listening', 'Sections 1-2-3 in sequence: timed 22 minutes, answer review and error analysis', false),
              makeDay('Fri', 'Writing', 'Task 2: write complete introduction + 2 body paragraphs — minimum 220 words', false),
              makeDay('Sat', 'Speaking', 'Fluency drill: 2-minute monologue on 5 different topics without stopping or repeating', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 2, focus: 'Writing & Speaking Confidence',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', 'Discourse markers for writing: Furthermore, However, Nevertheless, As a result, In contrast (20 phrases)', false),
              makeDay('Tue', 'Grammar', 'Reported speech: say → said, tell → told — direct to indirect 20 exercises', false),
              makeDay('Wed', 'Reading', 'Matching information to paragraphs: scan, don\'t re-read — 10 questions, 15 minutes', false),
              makeDay('Thu', 'Listening', 'Section 4 academic lecture — 10 questions, note-taking strategy, timed 10 minutes', false),
              makeDay('Fri', 'Writing', 'Task 1 + Task 2 in sequence: bar chart (150 words, 20 min) + opinion essay (250 words, 40 min)', false),
              makeDay('Sat', 'Speaking', 'Part 3 advanced: argue both sides of 5 social issues — clear position + 2 supporting points', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 3, focus: 'First Full Mock Test Experience',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', 'Review weak vocabulary from Months 1-2 + learn 20 new words in topic: Science & Research', false),
              makeDay('Tue', 'Grammar', 'Grammar review: all covered topics — 30-question mixed quiz, identify and fix errors', false),
              makeDay('Wed', 'Reading', 'Full 60-minute Reading mock: 3 passages, all question types — strict timing', false),
              makeDay('Thu', 'Listening', 'Full 30-minute Listening mock: all 4 sections — answer then review all errors', false),
              makeDay('Fri', 'Writing', 'Full 60-minute Writing mock: Task 1 (20 min) + Task 2 (40 min) — submit to Write & Improve', false),
              makeDay('Sat', 'Speaking', 'Full Speaking mock: record 12-minute interview (Parts 1+2+3) — self-evaluate fluency and vocabulary', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 4, focus: 'Mock Test Analysis & Weak Area Drilling',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', 'Topic: Urban Living & Society — 25 words + review all weaknesses identified in mock', false),
              makeDay('Tue', 'Grammar', 'Target grammar gaps found in mock test — focused 45-minute drilling on weak areas only', false),
              makeDay('Wed', 'Reading', 'Drill weakest Reading question type: study strategy + 15 questions on that type only', false),
              makeDay('Thu', 'Listening', 'Drill weakest Listening section: listen twice, compare transcripts, understand every error', false),
              makeDay('Fri', 'Writing', 'Rewrite the weakest essay from mock: apply feedback, focus on coherence and vocabulary range', false),
              makeDay('Sat', 'Speaking', 'Month review: 3 new Part 2 topics, extend answers with examples and reasons — final fluency check', false),
              restDay('Sun'),
            ],
          },
        ],
      },
    ];

    // Remaining months: themed with progressively harder content
    const TIER1_THEMES: [string, string][] = [
      ['Advanced Question Types & Timed Practice', 'Master all IELTS question types under exam-like time pressure'],
      ['Writing Excellence — Task 1 + Task 2', 'Write complete, well-structured responses for both writing tasks'],
      ['Speaking Fluency & Vocabulary Range', 'Build confident speaking with topic-specific vocabulary'],
      ['Full Mock Test Cycle & Score Calibration', 'Complete full mock tests and accurately measure your current band'],
      ['Intensive Error Analysis & Weak Skill Drilling', 'Target and eliminate the most common errors from mock tests'],
      ['Pre-Exam Momentum — Speed & Accuracy', 'Sharpen timing and reduce careless errors across all skills'],
      ['Final Polish & Exam Confidence', 'Light review, exam strategy consolidation, and mental readiness'],
    ];

    const skillRotation = ['Vocabulary', 'Grammar', 'Reading', 'Listening', 'Writing', 'Speaking'];
    const weekTopics: Record<string, string[]> = {
      Vocabulary: ['Academic Word List clusters', 'Topic-based collocations', 'Synonyms and word forms', 'Vocabulary in context exercises'],
      Grammar: ['Conditional sentences review', 'Passive voice and nominalization', 'Relative clauses and complex sentences', 'Mixed grammar timed quiz'],
      Reading: ['T/F/NG strategy drill', 'Note completion practice', 'Matching headings exercise', 'Full timed reading passage'],
      Listening: ['Section 1+2 back-to-back', 'Section 3+4 academic listening', 'Note-taking from lecture', 'Full timed listening mock'],
      Writing: ['Task 1 data description', 'Task 2 body paragraph PEEL', 'Full Task 1 + Task 2 session', 'Essay review and rewrite'],
      Speaking: ['Part 1 speed drill', 'Part 2 cue card practice', 'Part 3 abstract discussion', 'Full recorded mock interview'],
    };

    for (let m = 4; m <= monthsNeeded; m++) {
      const themeIdx = Math.min(m - 4, TIER1_THEMES.length - 1);
      const [theme, objective] = TIER1_THEMES[themeIdx];
      months.push({
        month: m, theme, total_hours: monthlyHours,
        objective: `${objective} — Month ${m} of ${monthsNeeded}`,
        week_summaries: [1, 2, 3, 4].map(w => ({
          week_in_month: w,
          focus: `Week ${w}: ${theme.split('&')[0].trim()} — progressive difficulty`,
          daily_schedule: DAYS.map((day, i) => {
            if (i === 6) return restDay(day);
            const skill = skillRotation[i];
            const topics = weekTopics[skill] ?? [];
            return makeDay(day, skill, topics[(w - 1) % topics.length] ?? `${skill} — Month ${m} advanced practice`, false);
          }),
        })),
      });
    }

    return months;
  }

  // ─── TIER 2: B1 / B2 — Medium pace, one main skill per day ────────────────
  private tier2Plan(dto: GenerateScheduleDto, monthsNeeded: number, monthlyHours: number): MonthPlan[] {
    const ex = dto.target_exam;
    const band = dto.target_band ?? '';
    const months: MonthPlan[] = [
      {
        month: 1, theme: 'Listening & Reading Excellence', total_hours: monthlyHours,
        objective: `Achieve consistent ${ex} Listening + Reading accuracy. Master all question types in both skills.`,
        week_summaries: [
          {
            week_in_month: 1, focus: 'Reading Deep Dive — All Question Types',
            daily_schedule: [
              makeDay('Mon', 'Reading', 'T/F/NG strategy + 15 questions from past paper — focus: "Not Given" identification', false),
              makeDay('Tue', 'Vocabulary', `${ex} academic word list: 30 high-frequency words in authentic passages — learn in context`, false),
              makeDay('Wed', 'Reading', 'Matching headings + sentence completion — 2 full passages (400 words each), timed 30 min', false),
              makeDay('Thu', 'Listening', `${ex} Listening: all 4 sections back-to-back — full 30-minute timed practice`, false),
              makeDay('Fri', 'Grammar', 'Complex sentences: subordinate clauses, conditionals, passive — 20 academic writing exercises', false),
              makeDay('Sat', 'Reading', 'Full Reading mock: 3 passages, all question types — 60 minutes strict, then full review', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 2, focus: 'Listening Accuracy — Sections 3 & 4',
            daily_schedule: [
              makeDay('Mon', 'Listening', 'Sections 3+4 intensive: academic discussion + lecture — note-taking strategy + error analysis', false),
              makeDay('Tue', 'Vocabulary', 'Collocations for academic topics: conduct research, draw conclusions, substantial evidence (40 phrases)', false),
              makeDay('Wed', 'Listening', 'Listening speed training: 1.1x speed recordings — identify keywords, ignore unknown words', false),
              makeDay('Thu', 'Reading', 'Scanning for specific detail + diagram completion — 2 passages, race against clock', false),
              makeDay('Fri', 'Grammar', 'Relative clauses + noun phrases for complex academic writing — 3 rewrites of simple sentences', false),
              makeDay('Sat', 'Listening', 'Full Listening mock (30 min) + complete transcript review — understand every error', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 3, focus: 'Vocabulary Range & Grammar Accuracy',
            daily_schedule: [
              makeDay('Mon', 'Vocabulary', `Topic-cluster vocabulary: Environment, Technology, Health — 20 words + collocations each`, false),
              makeDay('Tue', 'Grammar', '3rd Conditional + Mixed conditionals — express regret and hypothetical past + 15 exercises', false),
              makeDay('Wed', 'Vocabulary', 'Synonyms for common ${ex} overused words: think→argue, big→substantial, important→crucial', false),
              makeDay('Thu', 'Grammar', 'Cohesive devices: however, furthermore, consequently, in contrast — use in 10 academic sentences', false),
              makeDay('Fri', 'Vocabulary', 'Word formation: noun/verb/adjective/adverb families — 30 words (economy→economic→economically)', false),
              makeDay('Sat', 'Reading', 'Vocabulary in context: 2 passages — guess meaning from context, then verify with dictionary', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 4, focus: 'Month 1 Integration — Full Skills Review',
            daily_schedule: [
              makeDay('Mon', 'Reading', 'Timed reading: 3 passages (60 min) — identify weak question types for Month 2 focus', false),
              makeDay('Tue', 'Listening', 'Full 30-min listening + detailed error analysis — categorise errors by type', false),
              makeDay('Wed', 'Vocabulary', 'Month 1 vocabulary consolidation: 100+ words flashcard sprint — target <5s per card', false),
              makeDay('Thu', 'Grammar', 'Grammar audit: take 30-question test covering all Month 1 grammar — identify gaps', false),
              makeDay('Fri', 'Reading', `${ex} Reading strategy refinement: speed vs. accuracy balance — timed 30-min half-test`, false),
              makeDay('Sat', 'Listening', 'Dictation exercise: transcribe 3 minutes of lecture audio — check word-for-word accuracy', false),
              restDay('Sun'),
            ],
          },
        ],
      },
      {
        month: 2, theme: 'Writing Development — Band ' + (band || '6.0') + ' Writing', total_hours: monthlyHours,
        objective: 'Write clear, well-structured Task 1 and Task 2 responses with appropriate vocabulary and cohesion',
        week_summaries: [
          {
            week_in_month: 1, focus: 'Task 1 Mastery — Data Description',
            daily_schedule: [
              makeDay('Mon', 'Writing', 'Task 1 overview: data types (bar, line, pie, table, map, process) — response template for each', false),
              makeDay('Tue', 'Vocabulary', 'Task 1 language: data description phrases — peaked at, comprised, accounted for, illustrated by', false),
              makeDay('Wed', 'Writing', 'Task 1 bar chart: write full 150-word response in 20 minutes — overview paragraph focus', false),
              makeDay('Thu', 'Grammar', 'Comparative structures for Task 1: as high as, twice the number, significantly more — 20 sentences', false),
              makeDay('Fri', 'Writing', 'Task 1 line graph: write full response — select and describe 2-3 key trends with data points', false),
              makeDay('Sat', 'Writing', 'Task 1 peer check: re-read your 2 responses — apply IELTS Task 1 band descriptor checklist', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 2, focus: 'Task 2 Structure & Argumentation',
            daily_schedule: [
              makeDay('Mon', 'Writing', 'Task 2 essay types: opinion (agree/disagree) + discussion (both sides) — structure each type', false),
              makeDay('Tue', 'Vocabulary', 'Task 2 academic phrases: it is widely accepted that, evidence suggests, proponents argue, notably', false),
              makeDay('Wed', 'Writing', 'Write complete opinion essay: strong thesis + 2 PEEL paragraphs + conclusion — 250 words, 40 min', false),
              makeDay('Thu', 'Grammar', 'Complex sentences for academic writing: combine 3 simple sentences into 1 complex — 10 pairs', false),
              makeDay('Fri', 'Writing', 'Write complete discussion essay: balanced view + personal opinion — 260 words, 40 min', false),
              makeDay('Sat', 'Writing', 'Writing workshop: review both essays, improve vocabulary, fix grammar, improve coherence', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 3, focus: 'Advanced Writing: Cohesion & Lexical Resource',
            daily_schedule: [
              makeDay('Mon', 'Writing', 'Cohesion practice: link 5 paragraphs using pronouns, synonyms, and discourse markers fluently', false),
              makeDay('Tue', 'Vocabulary', 'Lexical resource upgrade: replace 20 basic words with sophisticated alternatives in real contexts', false),
              makeDay('Wed', 'Writing', 'Task 2 problem-solution essay: 260 words — identify 2 problems, propose 2 concrete solutions', false),
              makeDay('Thu', 'Grammar', 'Gerunds vs. infinitives + participial phrases for academic conciseness — 10 sentence transformations', false),
              makeDay('Fri', 'Writing', 'Timed Writing session: Task 1 (20 min) + Task 2 (40 min) back-to-back — real exam conditions', false),
              makeDay('Sat', 'Writing', 'Submit essay to Write & Improve (Cambridge) — read AI feedback + make corrections', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 4, focus: 'Full Writing Mock & Feedback',
            daily_schedule: [
              makeDay('Mon', 'Writing', 'Task 1: maps/process diagram — describe changes using passive voice and sequence words', false),
              makeDay('Tue', 'Grammar', 'Essay grammar audit: check subject-verb agreement, tense consistency, article use in own essays', false),
              makeDay('Wed', 'Writing', 'Full 60-minute Writing mock: Task 1 + Task 2 under strict exam conditions', false),
              makeDay('Thu', 'Vocabulary', 'Post-mock vocabulary: identify 10 words you wanted to use but didn\'t know — learn and practice', false),
              makeDay('Fri', 'Writing', 'Rewrite weakest essay from mock: apply all feedback — improve at least 1 full band', false),
              makeDay('Sat', 'Writing', 'Writing reflection: compare Month 1 vs. Month 2 essays — document visible improvement', false),
              restDay('Sun'),
            ],
          },
        ],
      },
      {
        month: 3, theme: 'Speaking & Full Integration — Mock Tests', total_hours: monthlyHours,
        objective: 'Build Speaking fluency and vocabulary range. Complete 2 full mock tests. Target score within reach.',
        week_summaries: [
          {
            week_in_month: 1, focus: 'Speaking Fluency — All 3 Parts',
            daily_schedule: [
              makeDay('Mon', 'Speaking', 'Part 1 speed drill: 15 questions back-to-back — 20-30 seconds per answer, no hesitation', false),
              makeDay('Tue', 'Vocabulary', 'Topic vocabulary for Speaking: Health, Technology, Environment — 10 sentences using each cluster', false),
              makeDay('Wed', 'Speaking', 'Part 2 cue cards: 5 topics, 2 minutes each — structure: intro + 3 points + opinion', false),
              makeDay('Thu', 'Listening', 'Full Listening mock (30 min) — focus on weak section identified in Month 1', false),
              makeDay('Fri', 'Speaking', 'Part 3 abstract discussion: argue both sides of 5 social issues — 3 sentences minimum each', false),
              makeDay('Sat', 'Speaking', 'Full Speaking mock: record 12-minute interview — evaluate: fluency, vocabulary, grammar, pronunciation', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 2, focus: 'Full Mock Test 1 — All 4 Skills',
            daily_schedule: [
              makeDay('Mon', 'Listening', 'Full Listening mock under exam conditions — then categorise every error by type', false),
              makeDay('Tue', 'Reading', 'Full Reading mock (60 min) — identify slowest question types for targeted practice', false),
              makeDay('Wed', 'Writing', 'Full Writing mock (60 min): Task 1 + Task 2 — time yourself strictly', false),
              makeDay('Thu', 'Speaking', 'Full Speaking mock (12 min recorded) — self-evaluate using band descriptor', false),
              makeDay('Fri', 'Vocabulary', 'Mock test vocabulary: words you didn\'t know in test — 20 new words + sentences', false),
              makeDay('Sat', 'Review', 'Mock test deep analysis: score each skill, identify top 3 weaknesses, plan Month 4 strategy', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 3, focus: 'Targeted Weakness Drilling',
            daily_schedule: [
              makeDay('Mon', 'Reading', 'Drill weakest Reading question type: 20 focused questions — understand every error', false),
              makeDay('Tue', 'Listening', 'Drill weakest Listening section: 3 recordings — transcribe then compare word by word', false),
              makeDay('Wed', 'Writing', 'Rewrite weakest essay from Mock 1: apply targeted improvements + submit for feedback', false),
              makeDay('Thu', 'Speaking', 'Drill Speaking weak areas: if vocabulary — learn 30 topic words; if fluency — shadow native speakers', false),
              makeDay('Fri', 'Grammar', 'Fix top 5 recurring grammar errors from mock essays and speaking recordings', false),
              makeDay('Sat', 'Review', 'Week consolidation: re-test on all weak areas, verify improvement — update study plan', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 4, focus: 'Full Mock Test 2 — Target Score Calibration',
            daily_schedule: [
              makeDay('Mon', 'Listening', 'Full Listening mock 2 — compare score to Mock 1, measure improvement', false),
              makeDay('Tue', 'Reading', 'Full Reading mock 2 — are you on track for target ' + (dto.target_band ?? 'band') + '?', false),
              makeDay('Wed', 'Writing', 'Full Writing mock 2 — apply all Month 2+3 improvements — improved response quality expected', false),
              makeDay('Thu', 'Speaking', 'Full Speaking mock 2 — record and compare to Mock 1 — fluency and vocabulary progress visible', false),
              makeDay('Fri', 'Review', 'Score analysis: Mock 1 vs Mock 2 comparison — celebrate improvement, identify remaining gaps', false),
              makeDay('Sat', 'Review', 'Plan remaining months: if on track → maintain pace; if behind → intensify weak skill focus', false),
              restDay('Sun'),
            ],
          },
        ],
      },
    ];

    const TIER2_THEMES: [string, string][] = [
      ['Advanced Mock Tests & Score Calibration', 'Complete 2 full mock tests and accurately measure band score progress'],
      ['Targeting Weak Areas — Deep Drilling', 'Eliminate systematic errors in the lowest-scoring skill'],
      ['Pre-Exam Optimization & Timing', 'Master exam timing strategies and reduce careless mistakes'],
      ['Final Polish & Exam-Day Readiness', 'Light maintenance, strategy consolidation, and peak mental state'],
    ];
    const tier2Skills = ['Listening', 'Reading', 'Writing', 'Speaking', 'Review', 'Practice Test'];
    const tier2Topics: Record<string, string[]> = {
      Listening: ['Sections 3+4 advanced listening', 'Prediction strategy + mock test', 'Accent variation practice', 'Full timed Listening mock'],
      Reading: ['Timed 3-passage reading', 'Inference and implicit meaning', 'Speed vs. accuracy calibration', 'Full timed Reading mock'],
      Writing: ['Task 2 lexical resource upgrade', 'Cohesion and coherence focus', 'Full timed Writing session', 'Essay rewrite with feedback'],
      Speaking: ['Part 3 abstract argumentation', 'Shadowing Band 8 recordings', 'Full recorded mock interview', 'Fluency and pronunciation drill'],
      Review: ['Mock test error classification', 'Weak question type drilling', 'Score trend analysis', 'Plan adjustment for next month'],
      'Practice Test': ['Full mock — all 4 skills', 'Individual skill timed test', 'Score calibration vs. target', 'Final preparation assessment'],
    };

    for (let m = 4; m <= monthsNeeded; m++) {
      const isLast = m === monthsNeeded;
      const themeIdx = isLast ? TIER2_THEMES.length - 1 : Math.min(m - 4, TIER2_THEMES.length - 2);
      const [theme, objective] = TIER2_THEMES[themeIdx];
      months.push({
        month: m, theme: isLast ? 'Pre-Exam Final Preparation' : theme,
        total_hours: monthlyHours,
        objective: isLast ? 'Final exam strategy, timing refinement, and peak performance preparation' : `${objective} — Month ${m} of ${monthsNeeded}`,
        week_summaries: [1, 2, 3, 4].map(w => ({
          week_in_month: w,
          focus: w <= 2 ? 'Full mock test + analysis' : w === 3 ? 'Targeted skill drilling' : 'Integration and final review',
          daily_schedule: DAYS.map((day, i) => {
            if (i === 6) return restDay(day);
            const skill = tier2Skills[i % tier2Skills.length];
            const topics = tier2Topics[skill] ?? [];
            return makeDay(day, skill, topics[(w - 1) % topics.length] ?? `${skill} — Month ${m} advanced practice`, false);
          }),
        })),
      });
    }

    return months;
  }

  // ─── TIER 3: C1 / C2 or IELTS 7+ — Professional, framework approach ────────
  private tier3Plan(dto: GenerateScheduleDto, monthsNeeded: number, monthlyHours: number): MonthPlan[] {
    const ex = dto.target_exam;
    const band = dto.target_band ?? '8.0';
    const months: MonthPlan[] = [
      {
        month: 1, theme: 'Advanced Writing Refinement & Band 7+ Techniques', total_hours: monthlyHours,
        objective: `Achieve ${ex} ${band} writing: coherence, cohesion, lexical precision, grammatical range and accuracy`,
        week_summaries: [
          {
            week_in_month: 1, focus: 'Task 2 Academic Writing — Sophistication',
            daily_schedule: [
              makeDay('Mon', 'Writing', 'Essay sophistication: replace all basic vocabulary — use corpus-based academic collocations', false),
              makeDay('Tue', 'Reading', 'Read Band 8-9 sample essays: analyse structure, cohesion, and lexical choices — annotate', false),
              makeDay('Wed', 'Writing', 'Write argue/discuss essay: complex sentence variety (complex, compound-complex) — 280 words', false),
              makeDay('Thu', 'Vocabulary', 'Advanced lexical resource: nuanced hedging language (arguably, it could be contended that)', false),
              makeDay('Fri', 'Writing', 'Task 1 advanced: multiple charts + compare/contrast — synthesise data across 2 graphs', false),
              makeDay('Sat', 'Review', 'Self-edit using ${ex} band descriptors: Lexical Resource + Grammatical Range checklists', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 2, focus: 'Listening & Reading at C1 Speed',
            daily_schedule: [
              makeDay('Mon', 'Listening', `${ex} advanced listening: identify speaker attitude, implicit meaning, and opinion nuance`, false),
              makeDay('Tue', 'Reading', 'Speed reading: 3 passages in 55 minutes — sacrifice 1 question for speed management', false),
              makeDay('Wed', 'Listening', 'Lecture comprehension: note-taking at native speed — compare notes with transcript', false),
              makeDay('Thu', 'Reading', 'Inference questions: identify implied meaning without direct evidence — 10 hard questions', false),
              makeDay('Fri', 'Listening', 'Accent variation practice: American, Australian, British, Indian English lectures', false),
              makeDay('Sat', 'Review', 'Full 60+30 minute combined Reading + Listening mock — score and analyse', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 3, focus: 'Speaking — Band 7+ Fluency & Precision',
            daily_schedule: [
              makeDay('Mon', 'Speaking', 'Shadow recording: mimic a Band 8 Speaking sample word-for-word — pronunciation + intonation', false),
              makeDay('Tue', 'Vocabulary', 'High-level topic lexis: Politics, Philosophy, Globalisation — 20 rarely-known but accurate words', false),
              makeDay('Wed', 'Speaking', 'Part 3 complex discussion: give nuanced answers using "while it might appear that... however..."', false),
              makeDay('Thu', 'Grammar', 'Advanced grammar: inversion, cleft sentences, ellipsis — 10 examples in academic context', false),
              makeDay('Fri', 'Speaking', 'Timed full interview (14 min): focus on discourse management and topic development', false),
              makeDay('Sat', 'Review', 'Record vs. Band 8 benchmark: compare your speaking to examiner\'s expectations', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 4, focus: 'Full Mock Test + Score Calibration',
            daily_schedule: [
              makeDay('Mon', 'Practice Test', `Full ${ex} mock: all sections under strict exam conditions`, false),
              makeDay('Tue', 'Review', 'Deep error analysis: classify every mistake (knowledge gap / careless / strategy)', false),
              makeDay('Wed', 'Writing', 'Rewrite weakest essay with all improvements applied — aim for observable quality jump', false),
              makeDay('Thu', 'Listening', 'Targeted drilling: only the specific sub-question type that caused most errors', false),
              makeDay('Fri', 'Speaking', 'Final speaking refinement: address top 2 assessed criteria that need improvement', false),
              makeDay('Sat', 'Review', 'Month 1 reflection: current estimated band? What is the gap to target? Adjust Month 2 plan.', false),
              restDay('Sun'),
            ],
          },
        ],
      },
    ];

    if (monthsNeeded >= 2) {
      months.push({
        month: 2, theme: 'Exam Strategy Optimization & Peak Performance', total_hours: monthlyHours,
        objective: `Fine-tune all 4 skills, master time management, and enter ${ex} ${band} with confidence`,
        week_summaries: [
          {
            week_in_month: 1, focus: 'Exam Timing & Strategy — No More Lost Points',
            daily_schedule: [
              makeDay('Mon', 'Practice Test', 'Reading timing drill: 20 min per passage — practice abandoning hard questions strategically', false),
              makeDay('Tue', 'Listening', 'Pre-read questions strategy: 30-second preview + annotation before each section starts', false),
              makeDay('Wed', 'Writing', 'Task 2 timing: outline 5 min → introduction 5 min → body 25 min → conclusion 5 min — drill this', false),
              makeDay('Thu', 'Speaking', 'Part 2 strategy: structured 1-minute mental outline before speaking — never ramble', false),
              makeDay('Fri', 'Review', 'Exam day simulation: test conditions, no breaks, replicate actual exam environment', false),
              makeDay('Sat', 'Practice Test', `Full ${ex} mock under real exam conditions — mental and physical preparation`, false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 2, focus: 'Final Polish — All 4 Skills',
            daily_schedule: [
              makeDay('Mon', 'Writing', 'Write 2 essays in 80 minutes: self-edit → submit to Write & Improve → apply feedback same day', false),
              makeDay('Tue', 'Listening', 'Predict answers before hearing: use context from question stem — educated guessing strategy', false),
              makeDay('Wed', 'Speaking', 'Spontaneous speaking: 90 seconds on random topics with no preparation — pure fluency test', false),
              makeDay('Thu', 'Reading', 'Eliminate clearly wrong options: MCQ + matching — save 30 seconds per question', false),
              makeDay('Fri', 'Practice Test', 'Final 2-skill mini mock: Reading + Writing back-to-back (2 hours 20 min)', false),
              makeDay('Sat', 'Review', 'Pre-exam checklist: all skills at target level? Logistics confirmed? Rest starts Sunday.', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 3, focus: 'Light Maintenance — Protect Your Progress',
            daily_schedule: [
              makeDay('Mon', 'Review', 'Light reading: 1 academic article + 5 questions — stay sharp, don\'t overwork', false),
              makeDay('Tue', 'Vocabulary', 'Review top 50 academic words: quick flashcard session, 30 minutes maximum', false),
              makeDay('Wed', 'Listening', 'Casual listening: TED Talk or academic podcast — note 5 new phrases, no pressure', false),
              makeDay('Thu', 'Speaking', '10-minute speaking warmup: 3 Part 2 topics, fluency focus — keep confidence high', false),
              makeDay('Fri', 'Writing', 'Write 1 essay: target topic from real past paper — do not over-analyse, trust your training', false),
              makeDay('Sat', 'Review', 'Final review: skim your best essays and speaking recordings — reinforce confidence', false),
              restDay('Sun'),
            ],
          },
          {
            week_in_month: 4, focus: 'Exam Week — Peak State',
            daily_schedule: [
              makeDay('Mon', 'Review', 'Day before exam: very light review only — 1 reading passage, 10 vocab cards, no stress', false),
              makeDay('Tue', 'Review', 'Exam day: arrive early, stay calm — trust 2 months of preparation', false),
              makeDay('Wed', 'Review', 'Post-exam: do NOT check answers online for 48 hours — rest and recover first', false),
              makeDay('Thu', 'Review', 'Reflect on exam experience: note what went well and what to improve for next time', false),
              makeDay('Fri', 'Review', 'Plan next steps: awaiting results — continue with StudySpark for skill maintenance', false),
              makeDay('Sat', 'Review', 'Results interpretation: use StudySpark AI Schedule for next goal if needed', false),
              restDay('Sun'),
            ],
          },
        ],
      });
    }

    // Tier 3 additional months if needed
    for (let m = months.length + 1; m <= monthsNeeded; m++) {
      const isLast = m === monthsNeeded;
      months.push({
        month: m,
        theme: isLast ? 'Exam Week — Peak Performance' : `Advanced Refinement — Month ${m}`,
        total_hours: monthlyHours,
        objective: isLast ? 'Final exam-day preparation, light review, and peak mental state' : `High-level skill refinement and exam strategy — Month ${m} of ${monthsNeeded}`,
        week_summaries: [1, 2, 3, 4].map(w => ({
          week_in_month: w,
          focus: isLast
            ? ['Pre-exam light review', 'Exam-day strategy', 'Post-exam reflection', 'Next goal planning'][w - 1]
            : ['Mock test + deep analysis', 'Targeted weak area drilling', 'Advanced writing + speaking', 'Full integration session'][w - 1],
          daily_schedule: DAYS.map((day, i) => {
            if (i === 6) return restDay(day);
            const skills = ['Writing', 'Reading', 'Listening', 'Speaking', 'Practice Test', 'Review'];
            return makeDay(day, skills[i % skills.length], `${isLast ? 'Final prep' : 'Advanced'} ${skills[i % skills.length]} — Month ${m}`, false);
          }),
        })),
      });
    }

    return months;
  }

  private buildTips(dto: GenerateScheduleDto, tier: 1 | 2 | 3, monthsNeeded: number): string[] {
    const tips: string[] = [];
    const ex = dto.target_exam;
    const band = dto.target_band;

    if (tier === 1) {
      tips.push(`Hãy kiên nhẫn — ${monthsNeeded} tháng là hành trình dài nhưng chắc chắn. Mỗi ngày chỉ 1 kỹ năng = học sâu, không bị choáng ngợp.`);
      tips.push('Quy tắc 21 ngày: cần 3 tuần liên tiếp để hình thành thói quen học. Đừng bỏ lịch quá 2 ngày liên tiếp.');
      tips.push('Chủ nhật là ngày nghỉ BẮT BUỘC — não cần ngủ để tổng hợp kiến thức vào bộ nhớ dài hạn. Đừng học thêm vào Chủ nhật.');
      tips.push(`Sau mỗi tháng, làm bài Entrance Exam trong StudySpark để đo tiến độ thực tế — đừng chỉ đánh giá cảm tính.`);
      tips.push(`Ghi nhật ký học: mỗi buổi học viết 1 câu về điều bạn học hôm đó bằng tiếng Anh — rèn Writing + củng cố kiến thức.`);
    } else if (tier === 2) {
      tips.push(`Từ ${dto.current_level} đến ${band ? ex + ' ' + band : ex} trong ${monthsNeeded} tháng là hoàn toàn khả thi nếu học đúng cách — chất lượng hơn số lượng.`);
      tips.push('Mỗi mock test là dữ liệu, không phải bài kiểm tra — phân tích từng lỗi sai để biết điểm yếu thực sự.');
      tips.push(`${ex} đánh giá 4 kỹ năng BẰNG NHAU — đừng bỏ qua Speaking vì nó chiếm 25% band điểm.`);
      tips.push('Học từ vựng trong ngữ cảnh đọc/nghe — không học từ đơn lẻ, học cụm từ và cách dùng trong câu.');
      tips.push(`Nếu Writing là điểm yếu: viết ít nhất 1 bài/ngày và submit lên Write & Improve (Cambridge) để nhận feedback AI miễn phí.`);
    } else {
      tips.push(`Ở trình độ ${dto.current_level}, bạn đã có nền tảng vững — ${monthsNeeded} tháng này là tinh chỉnh chiến lược và tối ưu band điểm.`);
      tips.push(`Band ${band ?? '7.5+'} yêu cầu ZERO careless errors — mỗi điểm rơi là điểm chiến lược, không phải kiến thức.`);
      tips.push('Phân tích examiner reports: hiểu chính xác tiêu chí chấm điểm và implement vào bài làm từng ngày.');
      tips.push(`Exposure to native-level ${ex} materials daily (TED Talks, The Economist, BBC Hardtalk) — ngôn ngữ học thụ động cũng quan trọng.`);
      tips.push('Trust your preparation — avoid over-studying the week before exam. Light review and peak mental state matter more.');
    }

    return tips;
  }

  private getResources(exam: string): { name: string; type: string; description: string }[] {
    const resourceMap: Record<string, { name: string; type: string; description: string }[]> = {
      IELTS: [
        { name: 'Cambridge IELTS 18 Official', type: 'book', description: '4 authentic IELTS tests with audio, answer keys, and examiner commentary' },
        { name: 'Write & Improve (Cambridge)', type: 'app', description: 'Free AI writing feedback aligned with IELTS band descriptors — submit essays anytime' },
        { name: 'IELTS.org Official Materials', type: 'website', description: 'Free sample test questions, band descriptors, and examiner tips from the official body' },
        { name: 'BBC 6 Minute English', type: 'podcast', description: 'Academic English listening practice — 6 minutes daily with transcript and vocabulary' },
        { name: 'British Council LearnEnglish', type: 'website', description: 'Free grammar, vocabulary, and skills practice with IELTS-aligned content' },
      ],
      TOEIC: [
        { name: 'ETS TOEIC Official Guide', type: 'book', description: 'Official TOEIC preparation with authentic practice tests and strategy guides' },
        { name: 'Business English Pod', type: 'podcast', description: 'Business English listening and vocabulary — essential for TOEIC Listening Parts 3-4' },
        { name: 'Wall Street Journal', type: 'website', description: 'Authentic business English reading for TOEIC Reading Part 7 comprehension' },
        { name: 'English Grammar in Use (Murphy)', type: 'book', description: 'Cambridge grammar reference — covers all TOEIC Part 5 grammar question types' },
        { name: 'TOEIC Prep by ETS', type: 'website', description: 'Official ETS preparation resources and score interpretation guide' },
      ],
      General: [
        { name: 'BBC Learning English', type: 'website', description: 'Free English lessons, vocabulary, grammar, and pronunciation — all levels' },
        { name: 'Duolingo', type: 'app', description: 'Daily gamified vocabulary and grammar practice with streaks' },
        { name: 'Grammarly', type: 'app', description: 'Real-time grammar and vocabulary feedback for all writing practice' },
        { name: 'Elllo.org', type: 'website', description: 'Free listening activities with transcripts — hundreds of authentic topics' },
        { name: 'Oxford Word Skills (Intermediate)', type: 'book', description: 'Systematic vocabulary building by topic and skill level' },
      ],
      TOEFL: [
        { name: 'The Official Guide to TOEFL iBT', type: 'book', description: 'ETS official guide with 4 full practice tests and scoring guides' },
        { name: 'Magoosh TOEFL Prep', type: 'app', description: 'Comprehensive TOEFL practice with expert video explanations' },
        { name: 'Academic Word List (Coxhead)', type: 'website', description: '570 most frequent academic words — essential for TOEFL Reading and Writing' },
        { name: 'NPR Podcasts', type: 'podcast', description: 'Academic-level English listening with transcripts for TOEFL Listening prep' },
        { name: 'TOEFL Prep (ETS)', type: 'website', description: 'Official TOEFL preparation materials and free practice tests' },
      ],
    };
    return resourceMap[exam] ?? resourceMap['General'];
  }
}
