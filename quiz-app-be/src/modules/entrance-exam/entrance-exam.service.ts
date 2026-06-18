import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { ExamQuestion, ExamResult, ExamType, StartExamDto, SubmitExamDto } from './dto/exam.dto';

function estimateIelts(pct: number): { band: string; level: string } {
  if (pct >= 90) return { band: '8.0–9.0', level: 'C2 — Expert' };
  if (pct >= 80) return { band: '7.0–7.5', level: 'C1 — Advanced' };
  if (pct >= 68) return { band: '6.0–6.5', level: 'B2 — Upper-Intermediate' };
  if (pct >= 55) return { band: '5.0–5.5', level: 'B1 — Intermediate' };
  if (pct >= 42) return { band: '4.0–4.5', level: 'A2 — Elementary' };
  if (pct >= 28) return { band: '3.0–3.5', level: 'A2 — Beginner' };
  return { band: '1.0–2.5', level: 'A1 — Starter' };
}

function estimateToefl(pct: number): { band: string; level: string } {
  const score = Math.round((pct / 100) * 120);
  if (score >= 100) return { band: `${score}/120`, level: 'C2 — Expert' };
  if (score >= 80)  return { band: `${score}/120`, level: 'C1 — Advanced' };
  if (score >= 60)  return { band: `${score}/120`, level: 'B2 — Upper-Intermediate' };
  if (score >= 42)  return { band: `${score}/120`, level: 'B1 — Intermediate' };
  if (score >= 24)  return { band: `${score}/120`, level: 'A2 — Elementary' };
  return { band: `${score}/120`, level: 'A1 — Beginner' };
}

function estimateToeic(pct: number): { band: string; level: string } {
  const score = Math.round((pct / 100) * 990);
  if (score >= 860) return { band: `${score}/990`, level: 'C1 — Advanced' };
  if (score >= 730) return { band: `${score}/990`, level: 'B2 — Upper-Intermediate' };
  if (score >= 550) return { band: `${score}/990`, level: 'B1 — Intermediate' };
  if (score >= 350) return { band: `${score}/990`, level: 'A2 — Elementary' };
  return { band: `${score}/990`, level: 'A1 — Beginner' };
}

const IELTS_THEMES = [
  'Healthcare & Medical Science — hospitals, clinics, medical research, public health policies',
  'Environment & Ecology — climate change, biodiversity, conservation, sustainable living',
  'Technology & Society — AI, digital transformation, social media, cybersecurity, smart devices',
  'Education & Academia — university life, teaching methods, educational research, learning styles',
  'Urban Development & Architecture — smart cities, housing, infrastructure, urban planning',
  'Business & Economics — entrepreneurship, globalisation, corporate culture, international trade',
];

const TOEFL_THEMES = [
  'Natural Sciences — Biology & Evolution: animal behavior, genetics, natural selection, ecosystems',
  'Physical Sciences — Geology & Astronomy: plate tectonics, star formation, climate cycles, glaciers',
  'Social Sciences — Anthropology & Archaeology: ancient civilizations, cultural evolution, human migration',
  'Arts & Humanities — Architecture & Art History: ancient monuments, artistic movements, cultural artifacts',
  'Life Sciences — Environmental Science: deforestation, biodiversity loss, conservation, ecosystem services',
  'History & Society — Modern History: social movements, political systems, scientific revolutions, urbanization',
];

const TOEIC_THEMES = [
  'Hotel & Hospitality Management — reservations, events, guest services, catering',
  'Technology & IT Services — software development, cloud systems, tech support, digital tools',
  'Healthcare Administration — medical offices, pharmacies, health insurance, patient services',
  'Retail & Consumer Services — sales, customer complaints, store operations, inventory',
  'Finance & Banking Operations — accounts, investments, transactions, quarterly reporting',
  'Manufacturing & Supply Chain — production planning, logistics, quality control, vendor relations',
];

@Injectable()
export class EntranceExamService {
  private readonly logger = new Logger(EntranceExamService.name);
  private readonly client: Anthropic | null;
  // Server-side session cache — prevents client from manipulating correct_answer for cheating
  private readonly sessionCache = new Map<string, ExamQuestion[]>();

  constructor(private config: ConfigService) {
    const key = this.config.get<string>('ANTHROPIC_API_KEY');
    this.client = key && key !== 'your-anthropic-api-key-here' ? new Anthropic({ apiKey: key }) : null;
  }

  private newSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  async generateExam(dto: StartExamDto): Promise<{ questions: ExamQuestion[]; time_limit: number; exam_type: ExamType; variant: number; session_id: string }> {
    const variant = dto.variant ?? Math.floor(Math.random() * 6);
    const themes = dto.exam_type === 'ielts' ? IELTS_THEMES : dto.exam_type === 'toefl' ? TOEFL_THEMES : TOEIC_THEMES;
    const theme = themes[variant % themes.length];
    const timeLimit = dto.exam_type === 'toefl' ? 35 : 25;

    let questions: ExamQuestion[];

    if (!this.client) {
      questions = this.getFallbackQuestions(dto.exam_type, variant);
    } else {
      const prompt = dto.exam_type === 'ielts' ? this.buildIeltsPrompt(theme) : dto.exam_type === 'toefl' ? this.buildToeflPrompt(theme) : this.buildToeicPrompt(theme);
      try {
        const res = await this.client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 7000,
          messages: [{ role: 'user', content: prompt }],
        });
        const text = (res.content[0] as { text: string }).text.trim();
        const json = text.replace(/```json\n?|```/g, '').trim();
        questions = JSON.parse(json);
      } catch (e) {
        this.logger.error('AI exam generation failed', e);
        questions = this.getFallbackQuestions(dto.exam_type, variant);
      }
    }

    const session_id = this.newSessionId();
    this.sessionCache.set(session_id, questions);
    // Auto-evict session after 2 hours
    setTimeout(() => this.sessionCache.delete(session_id), 2 * 60 * 60 * 1000);

    return { questions, time_limit: timeLimit, exam_type: dto.exam_type, variant, session_id };
  }

  evaluateExam(dto: SubmitExamDto): ExamResult {
    const questions = this.sessionCache.get(dto.session_id);
    if (!questions) {
      // Session expired or invalid — return zero score
      return { total: 0, correct: 0, score_percent: 0, estimated_band: 'N/A', estimated_score: 'N/A', level: 'Session expired', breakdown: [], recommendations: ['Please start a new exam session.'], weak_areas: [] };
    }
    this.sessionCache.delete(dto.session_id); // one-time use

    const { answers, exam_type } = dto;
    const answerMap = new Map(answers.map(a => [a.question_id, a.selected]));

    const breakdown: Record<string, { correct: number; total: number }> = {};
    let correct = 0;
    let scoredTotal = 0;

    for (const q of questions) {
      if (q.section === 'Writing') continue;

      const key = q.section;
      if (!breakdown[key]) breakdown[key] = { correct: 0, total: 0 };
      breakdown[key].total++;
      scoredTotal++;

      const selected = answerMap.get(q.id);
      if (selected !== undefined && selected === q.correct_answer) {
        correct++;
        breakdown[key].correct++;
      }
    }

    const pct = scoredTotal > 0 ? Math.round((correct / scoredTotal) * 100) : 0;
    const est = exam_type === 'ielts' ? estimateIelts(pct) : exam_type === 'toefl' ? estimateToefl(pct) : estimateToeic(pct);

    const weak_areas = Object.entries(breakdown)
      .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.6)
      .map(([k]) => k);

    const recommendations = this.buildRecommendations(exam_type, pct, weak_areas);

    return {
      total: scoredTotal,
      correct,
      score_percent: pct,
      estimated_band: est.band,
      estimated_score: est.band,
      level: est.level,
      breakdown: Object.entries(breakdown).map(([section, v]) => ({ section, ...v })),
      recommendations,
      weak_areas,
    };
  }

  private buildIeltsPrompt(theme: string): string {
    return `You are an official IELTS exam designer. Generate exactly 20 IELTS Academic mini-test questions.

EXAM THEME: ${theme}
All passages, dialogues, and topics must relate authentically to this theme domain.

SECTION DISTRIBUTION:
- Listening Part 1: ids 1–4   (social context dialogue)
- Listening Part 2: ids 5–7   (public monologue / announcement)
- Reading:          ids 8–18  (academic passage — 11 questions)
- Writing:          ids 19–20 (2 free-response writing tasks — NO options, NO correct_answer)

═══════════════════════════════════════════
LISTENING PART 1 (Questions 1–4)
═══════════════════════════════════════════
- Write ONE realistic dialogue transcript (130–160 words) between two people in a social/everyday context related to the theme. British English. Natural spoken register.
- Set "passage" on Q1 ONLY. Q2–Q4: passage = null.
- Question types (mix): Note Completion, Multiple Choice, True/False/Not Given
- Questions test specific details from the transcript (names, dates, times, prices, locations).

LISTENING PART 2 (Questions 5–7)
═══════════════════════════════════════════
- Write ONE monologue transcript (120–150 words): a public announcement, broadcast, or tour related to the theme. Different topic from Part 1.
- Set "passage" on Q5 ONLY. Q6–Q7: passage = null.
- Question types: MCQ (4 options) testing main idea, specific detail, or speaker's purpose.

READING (Questions 8–18)
═══════════════════════════════════════════
- Write ONE academic passage (400–440 words) on a scientific or social topic within the theme.
- Set "passage" on Q8 ONLY. Q9–Q18: passage = null.
- Q8–Q12: Note/Summary Completion — 4 plausible options, only one is the exact word from the passage.
- Q13–Q18: True / False / Not Given — exactly 3 options: ["A. True", "B. False", "C. Not Given"]

WRITING (Questions 19–20) — FREE RESPONSE, NO OPTIONS
═══════════════════════════════════════════
- Q19: Writing Task 1 — Set "passage" to a brief data description (40–60 words). Question = "Task 1 (minimum 150 words): [Summarise the information...]". options = []. correct_answer = -1. explanation = "".
- Q20: Writing Task 2 — passage = null. Question = "Task 2 (minimum 250 words): [Opinion/discussion essay prompt related to the theme]". options = []. correct_answer = -1. explanation = "".

═══════════════════════════════════════════
OUTPUT FORMAT — Return ONLY a JSON array, no markdown:
[
  {
    "id": 1,
    "section": "Listening Part 1",
    "type": "note-completion",
    "passage": "transcript text (Q1 and Q5 only; null for all others)",
    "question": "question text",
    "options": ["A. option", "B. option", "C. option", "D. option"],
    "correct_answer": 0,
    "explanation": "brief explanation"
  }
]

Section names MUST be exactly: "Listening Part 1", "Listening Part 2", "Reading", "Writing"
For T/F/NG: options = ["A. True", "B. False", "C. Not Given"] (exactly 3)
For Writing tasks (Q19–20): options = [], correct_answer = -1, explanation = ""
All other questions: exactly 4 options.
Make questions authentic IELTS difficulty (B1–C1 range).`;
  }

  private buildToeicPrompt(theme: string): string {
    return `You are an official TOEIC exam designer. Generate exactly 20 TOEIC mini-test questions following the real ETS TOEIC format.

EXAM THEME: ${theme}
All passages, dialogues, and workplace scenarios must relate authentically to this theme domain.

SECTION DISTRIBUTION (total 20 questions):
- Listening Part 1: ids 1–2   (Photographs)
- Listening Part 2: ids 3–5   (Question-Response)
- Listening Part 3: ids 6–8   (Short Conversations — 1 dialogue × 3 questions)
- Listening Part 4: ids 9–10  (Short Talks — 1 monologue × 2 questions)
- Reading Part 5:   ids 11–15 (Incomplete Sentences — grammar & vocabulary)
- Reading Part 6:   ids 16–18 (Text Completion — 1 passage × 3 blanks)
- Reading Part 7:   ids 19–20 (Reading Comprehension — 1 article × 2 questions)

══════════════════════════════════════════════════════
LISTENING PART 1 — Photographs (Q1–Q2)
══════════════════════════════════════════════════════
- Describe a realistic workplace photo scene related to the theme in 30–40 words as "passage".
- 4 options (A–D): one describes what IS happening; three describe what is NOT.

LISTENING PART 2 — Question-Response (Q3–Q5)
══════════════════════════════════════════════════════
- "passage" = the short question or statement that is heard (10–20 words).
- EXACTLY 3 options only: A, B, C — this is real TOEIC Part 2 format.
- Only one response is logically appropriate; two are irrelevant or mismatched.

LISTENING PART 3 — Short Conversations (Q6–Q8)
══════════════════════════════════════════════════════
- ONE realistic business dialogue between 2 people (80–100 words) related to the theme. Set "passage" on Q6. Q7–Q8: passage = null.
- 3 questions testing: main purpose, specific detail, speaker's next action.
- 4 options each (A–D).

LISTENING PART 4 — Short Talks (Q9–Q10)
══════════════════════════════════════════════════════
- ONE business monologue (announcement, voicemail, or advertisement, 70–90 words) related to the theme. Set "passage" on Q9. Q10: passage = null.
- 2 questions: main topic, specific detail, or implied meaning.
- 4 options each (A–D).

READING PART 5 — Incomplete Sentences (Q11–Q15)
══════════════════════════════════════════════════════
- 5 independent business sentences, each with one blank. passage = null.
- Cover ALL of: verb form, preposition, conjunction, word form, article/determiner.
- 4 options each (A–D). Professional/corporate context within the theme.

READING PART 6 — Text Completion (Q16–Q18)
══════════════════════════════════════════════════════
- ONE business email, memo, or notice (180–210 words) related to the theme with exactly 3 blanks marked [BLANK_1] [BLANK_2] [BLANK_3].
- Set "passage" on Q16 ONLY. Q17–Q18: passage = null.
- Each question fills one blank. Options: 4 choices.

READING PART 7 — Reading Comprehension (Q19–Q20)
══════════════════════════════════════════════════════
- ONE business article, report, or notice (200–240 words) related to the theme. Set "passage" on Q19. Q20: passage = null.
- Q19: Main idea / purpose question. Q20: Specific detail or inference question.
- 4 options each (A–D).

══════════════════════════════════════════════════════
Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "id": 1,
    "section": "Listening Part 1",
    "type": "photograph",
    "passage": "passage text or null",
    "question": "question text",
    "options": ["A. option", "B. option", "C. option", "D. option"],
    "correct_answer": 0,
    "explanation": "brief explanation"
  }
]

CRITICAL RULES:
- Section names MUST be exactly: "Listening Part 1", "Listening Part 2", "Listening Part 3", "Listening Part 4", "Reading Part 5", "Reading Part 6", "Reading Part 7"
- Listening Part 2 MUST have exactly 3 options (A, B, C) — NOT 4
- All other questions: exactly 4 options (A, B, C, D)
- passage = null for all questions except Q1, Q2, Q3, Q4, Q5, Q6, Q9, Q16, Q19
- Business/professional English throughout`;
  }

  private buildToeflPrompt(theme: string): string {
    return `You are an official TOEFL iBT exam designer. Generate exactly 20 TOEFL iBT mini-test questions following authentic ETS TOEFL format.

EXAM THEME: ${theme}
All academic passages, lectures, and discussions must relate authentically to this theme.

SECTION DISTRIBUTION (total 20 questions):
- Reading Passage 1:      ids 1–5   (5 MCQ — academic reading)
- Reading Passage 2:      ids 6–10  (5 MCQ — academic reading)
- Listening — Lecture:    ids 11–14 (4 MCQ — academic lecture)
- Listening — Discussion: ids 15–18 (4 MCQ — classroom discussion)
- Writing:                ids 19–20 (2 free-response tasks — no options)

═══════════════════════════════════════════
READING PASSAGE 1 (Questions 1–5)
═══════════════════════════════════════════
- Write one academic passage (380–420 words) on a topic within the theme. Set "passage" on Q1 ONLY. Q2–Q5: passage = null.
- Question types (mix): main idea, vocabulary in context, factual detail, inference, purpose of paragraph.
- 4 options each (A–D). Academic difficulty (B2–C1).

READING PASSAGE 2 (Questions 6–10)
═══════════════════════════════════════════
- Write a DIFFERENT academic passage (380–420 words) on another aspect of the theme. Set "passage" on Q6 ONLY. Q7–Q10: passage = null.
- Same question type mix as Passage 1. 4 options each (A–D).

LISTENING — LECTURE (Questions 11–14)
═══════════════════════════════════════════
- Write a realistic professor's lecture transcript (200–240 words) on an academic topic within the theme. Set "passage" on Q11 ONLY. Q12–Q14: passage = null.
- Questions test: main idea, specific detail, speaker's attitude, inferred meaning.
- 4 options each (A–D).

LISTENING — DISCUSSION (Questions 15–18)
═══════════════════════════════════════════
- Write a realistic classroom discussion (180–220 words) between professor and 2–3 students on a topic within the theme. Set "passage" on Q15 ONLY. Q16–Q18: passage = null.
- Questions test: student's opinion, professor's point, implied meaning, purpose.
- 4 options each (A–D).

WRITING (Questions 19–20) — FREE RESPONSE
═══════════════════════════════════════════
- Q19: Integrated Writing (20 min). passage = a 60-word reading passage about a position or claim related to the theme. question = "Integrated Writing Task (minimum 150 words): Summarize the points made in the lecture and explain how they relate to the reading passage." options = []. correct_answer = -1. explanation = "".
- Q20: Academic Discussion Writing (10 min). passage = null. question = "Academic Discussion Task (minimum 100 words): [A professor posts a discussion question related to the theme with two student responses shown. Write your contribution.]" options = []. correct_answer = -1. explanation = "".

═══════════════════════════════════════════
OUTPUT FORMAT — Return ONLY a valid JSON array, no markdown:
[
  {
    "id": 1,
    "section": "Reading Passage 1",
    "type": "main-idea",
    "passage": "passage text (Q1, Q6, Q11, Q15 only; null for all others)",
    "question": "question text",
    "options": ["A. option", "B. option", "C. option", "D. option"],
    "correct_answer": 0,
    "explanation": "brief explanation"
  }
]

Section names MUST be exactly: "Reading Passage 1", "Reading Passage 2", "Listening — Lecture", "Listening — Discussion", "Writing"
Writing tasks (Q19–20): options = [], correct_answer = -1, explanation = ""
All other questions: exactly 4 options (A–D). Academic difficulty (B2–C1 CEFR).`;
  }

  private buildRecommendations(examType: ExamType, pct: number, weakSections: string[]): string[] {
    const tips: string[] = [];

    if (examType === 'toefl') {
      if (pct >= 85) tips.push('Xuất sắc! 100+ điểm TOEFL. Nhắm tới 110+ bằng cách luyện Speaking integrated tasks và Writing fluency.');
      else if (pct >= 70) tips.push('Tốt! 85–100 điểm TOEFL. Tập trung vào Listening lecture comprehension và Reading inference questions.');
      else if (pct >= 55) tips.push('60–80 điểm TOEFL. Đọc sách giáo khoa tiếng Anh học thuật hàng ngày và luyện note-taking khi nghe lecture.');
      else tips.push('Dưới 60 điểm TOEFL. Bắt đầu xây dựng vốn từ vựng học thuật (AWL) và luyện nghe Academic English hàng ngày.');

      for (const sec of weakSections) {
        if (sec.startsWith('Reading')) tips.push(`${sec}: Luyện đọc academic texts từ Scientific American, JSTOR. Chú ý main idea và inference questions.`);
        if (sec === 'Listening — Lecture') tips.push('Listening Lecture: Nghe MIT OpenCourseWare lectures và TED-Ed. Luyện note-taking theo Cornell method.');
        if (sec === 'Listening — Discussion') tips.push('Listening Discussion: Nghe academic podcasts và luyện theo dõi multi-speaker conversations.');
      }
      tips.push('TOEFL Writing: Luyện Integrated task — đọc và nghe cùng chủ đề, sau đó tóm tắt mối liên hệ. Academic Discussion task: 100–150 từ, rõ ràng và có ví dụ.');
    } else if (examType === 'ielts') {
      if (pct >= 80) tips.push('Xuất sắc! Bạn đang ở mức Band 7–8. Tập trung vào Writing Task 2 coherence và Listening Part 3–4 để đạt Band 8+');
      else if (pct >= 65) tips.push('Khá tốt! Band 6–6.5. Cải thiện độ chính xác trong Reading T/F/NG và Listening note-taking');
      else if (pct >= 50) tips.push('Band 5–5.5. Ôn đều đặn mỗi ngày — tập trung vào từng kỹ năng riêng lẻ với tài liệu Cambridge IELTS');
      else tips.push('Band 4–4.5. Bắt đầu với nền tảng ngữ pháp và từ vựng học thuật trước khi luyện đề');

      for (const sec of weakSections) {
        if (sec === 'Listening Part 1') tips.push('Listening Part 1: Luyện nghe điền thông tin cụ thể (số điện thoại, tên, địa điểm). Nghe và ghi chú song song.');
        if (sec === 'Listening Part 2') tips.push('Listening Part 2: Luyện nghe monologue với BBC Radio 4 và TED Talks. Chú ý topic sentences.');
        if (sec === 'Reading') tips.push('Reading: Đọc báo khoa học hàng ngày (BBC Science, National Geographic). Luyện T/F/NG — phân biệt "False" vs "Not Given".');
      }
      tips.push('Writing: Luyện viết Task 1 (tối thiểu 150 từ) và Task 2 (tối thiểu 250 từ) mỗi ngày. Chú ý cấu trúc PEEL và từ vựng học thuật.');
    } else {
      if (pct >= 85) tips.push('Xuất sắc! 800+ điểm TOEIC. Duy trì và hướng tới 900+ bằng cách tập trung Reading Part 7 double/triple passage');
      else if (pct >= 70) tips.push('Tốt! 650–750 điểm. Cải thiện Grammar Part 5 và Text Completion Part 6 để đạt 800+');
      else if (pct >= 50) tips.push('450–600 điểm. Ôn 12 điểm ngữ pháp TOEIC và từ vựng kinh doanh mỗi ngày 30 phút');
      else tips.push('Dưới 450 điểm. Bắt đầu với TOEIC starter materials và business English listening hàng ngày');

      for (const sec of weakSections) {
        if (sec.includes('Listening')) tips.push('TOEIC Listening: Luyện Part 1–4 với ETS Official Guide. Xem Business English Pod hàng ngày.');
        if (sec === 'Reading Part 5') tips.push('TOEIC Grammar: Ôn verb tense, prepositions, word form. Làm 20 câu Part 5 mỗi ngày.');
        if (sec === 'Reading Part 6') tips.push('Text Completion: Đọc email và memo thực tế. Chú ý từ kết nối và collocations kinh doanh.');
        if (sec === 'Reading Part 7') tips.push('TOEIC Reading: Đọc Wall Street Journal, Reuters Business. Luyện skimming và scanning Part 7.');
      }
    }

    tips.push('Dùng tính năng AI Schedule để AI lên lịch học cá nhân hóa phù hợp với kết quả này');
    return tips;
  }

  private getFallbackQuestions(examType: ExamType, variant: number = 0): ExamQuestion[] {
    const sets =
      examType === 'ielts'  ? [this.ieltsFallback0(),  this.ieltsFallback1(),  this.ieltsFallback2()]  :
      examType === 'toefl'  ? [this.toeflFallback0(),  this.toeflFallback1(),  this.toeflFallback2()]  :
                              [this.toeicFallback0(),  this.toeicFallback1(),  this.toeicFallback2()];
    const base = sets[variant % sets.length];
    const shuffleSeed = Math.floor(variant / sets.length);
    return shuffleSeed === 0 ? base : this.shuffleAnswers(base, shuffleSeed);
  }

  private shuffleAnswers(questions: ExamQuestion[], seed: number): ExamQuestion[] {
    const rng = (i: number): number => {
      const s = Math.sin(seed * 9301 + i * 49297 + 233720) * 10000;
      return s - Math.floor(s);
    };
    return questions.map((q, qi) => {
      if (!q.options.length || q.correct_answer < 0) return q;
      const indices = Array.from({ length: q.options.length }, (_, k) => k);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(rng(qi * 17 + i) * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      return {
        ...q,
        options: indices.map(idx => q.options[idx]),
        correct_answer: indices.indexOf(q.correct_answer),
      };
    });
  }

  // ─── TOEFL Fallback Set 0: Evolution · Plate Tectonics · Climate Discussion ──
  private toeflFallback0(): ExamQuestion[] {
    return [
      {
        id: 1, section: 'Reading Passage 1', type: 'main-idea',
        passage: `Natural selection is the primary mechanism by which evolution occurs. First described by Charles Darwin in 1859, natural selection operates on the principle that individuals within a population vary in their heritable traits, and that certain traits confer advantages in survival and reproduction within a given environment. Individuals possessing advantageous traits are more likely to survive, reproduce, and pass those traits to the next generation. Over many generations, this process can lead to dramatic changes in a population's characteristics and, ultimately, to the emergence of new species.\n\nOne of the most cited examples of natural selection in action is the peppered moth in industrialised Britain. Before the Industrial Revolution, the light-coloured form of the moth predominated because it was camouflaged against pale tree bark. When industrial pollution darkened the bark with soot, the light moths became conspicuous to predators, while darker variants gained a survival advantage. Within decades, the proportion of dark moths in polluted regions rose dramatically — a shift documented by scientist Bernard Kettlewell in the 1950s.\n\nModern evolutionary biology has confirmed and extended Darwin's ideas using molecular genetics. DNA analysis allows scientists to trace evolutionary relationships between species by comparing gene sequences. Organisms that share a common ancestor tend to have more similar DNA than those more distantly related. This approach, known as molecular phylogenetics, has revealed unexpected relationships — for instance, showing that hippos are more closely related to whales than to pigs or horses.\n\nNatural selection does not work alone. Genetic drift — random fluctuations in allele frequency — can cause evolutionary change especially in small populations. Sexual selection, another mechanism, favours traits that improve mating success even if they are otherwise costly to survival, explaining features like the peacock's elaborate tail. Together, these forces shape the incredible diversity of life on Earth.`,
        question: 'What is the main purpose of this passage?',
        options: [
          'A. To explain how the Industrial Revolution affected British wildlife',
          'B. To describe the mechanisms and evidence of evolutionary change',
          'C. To argue that genetic drift is more important than natural selection',
          'D. To discuss Darwin\'s personal life and scientific career'
        ],
        correct_answer: 1,
        explanation: 'The passage introduces natural selection, provides evidence (peppered moth), extends to molecular genetics, and mentions additional mechanisms — all supporting an overview of evolutionary change.'
      },
      {
        id: 2, section: 'Reading Passage 1', type: 'vocabulary',
        passage: null,
        question: 'The word "confer" in paragraph 1 is closest in meaning to:',
        options: ['A. remove', 'B. discuss', 'C. provide', 'D. require'],
        correct_answer: 2,
        explanation: '"Confer advantages" means to provide or grant advantages to the organisms that possess certain traits.'
      },
      {
        id: 3, section: 'Reading Passage 1', type: 'factual-detail',
        passage: null,
        question: 'According to the passage, why did dark peppered moths increase in number during industrialisation?',
        options: [
          'A. They were better adapted to urban food sources',
          'B. Light-coloured moths migrated to rural areas',
          'C. Soot darkened tree bark, making dark moths less visible to predators',
          'D. Scientists deliberately bred more dark moths'
        ],
        correct_answer: 2,
        explanation: 'The passage states industrial pollution darkened bark with soot, so dark moths "gained a survival advantage" by being less conspicuous to predators.'
      },
      {
        id: 4, section: 'Reading Passage 1', type: 'inference',
        passage: null,
        question: 'What can be inferred about molecular phylogenetics from the passage?',
        options: [
          'A. It has confirmed all of Darwin\'s original conclusions without revision',
          'B. It sometimes reveals evolutionary relationships that contradict physical appearance',
          'C. It is less reliable than fossil evidence for tracing ancestry',
          'D. It was developed before DNA was discovered'
        ],
        correct_answer: 1,
        explanation: 'The hippo-whale example shows that DNA analysis reveals relationships unexpected from physical appearance, implying molecular data can contradict superficial similarity.'
      },
      {
        id: 5, section: 'Reading Passage 1', type: 'factual-detail',
        passage: null,
        question: 'According to the passage, sexual selection explains which of the following?',
        options: [
          'A. The random fluctuation of allele frequency in small populations',
          'B. Why some organisms share common ancestors',
          'C. Features that improve mating success despite survival costs',
          'D. The rate at which new species emerge'
        ],
        correct_answer: 2,
        explanation: 'The passage explicitly states sexual selection "favours traits that improve mating success even if they are otherwise costly to survival."'
      },
      {
        id: 6, section: 'Reading Passage 2', type: 'main-idea',
        passage: `Plate tectonics is the scientific theory that Earth's outer shell is divided into several large, rigid segments called tectonic plates, which move slowly across the surface of the planet. Driven by heat from the Earth's interior, these plates interact in ways that produce earthquakes, volcanoes, and the formation of mountain ranges and ocean trenches. The theory, which achieved broad acceptance in the 1960s, unified many previously puzzling geological observations.\n\nAlfred Wegener proposed the concept of continental drift in 1912, noting that the coastlines of South America and Africa appeared to fit together like puzzle pieces. He also observed that identical fossil species and geological formations were found on continents now separated by vast oceans. Despite this evidence, Wegener's hypothesis was rejected by the scientific community partly because he could not explain the mechanism by which continents moved.\n\nThe breakthrough came in the 1950s and 1960s with the mapping of the ocean floor. Scientists discovered mid-ocean ridges — underwater mountain chains where new oceanic crust is continuously created as magma rises and solidifies. This process, called seafloor spreading, provided the missing mechanism: as new crust forms at ridges, older crust is pushed away and eventually descends back into the mantle at subduction zones. The symmetrical patterns of magnetic anomalies recorded in ocean-floor rocks confirmed that seafloor spreading was occurring at measurable rates.\n\nPlate boundaries take three primary forms. Divergent boundaries, such as the Mid-Atlantic Ridge, are where plates move apart and new crust forms. Convergent boundaries occur where plates collide; oceanic plates can be subducted beneath continental plates, producing volcanic arcs, while collisions of two continental plates create mountain ranges such as the Himalayas. Transform boundaries, like California's San Andreas Fault, are where plates slide horizontally past each other, generating frequent earthquakes but no new crust.`,
        question: 'What is the primary focus of this passage?',
        options: [
          'A. Wegener\'s personal struggles to gain scientific recognition',
          'B. The formation and types of ocean ridges',
          'C. The development and mechanisms of plate tectonic theory',
          'D. The relationship between earthquakes and climate change'
        ],
        correct_answer: 2,
        explanation: 'The passage traces the history of plate tectonic theory from Wegener\'s continental drift hypothesis through seafloor spreading to the classification of plate boundaries.'
      },
      {
        id: 7, section: 'Reading Passage 2', type: 'factual-detail',
        passage: null,
        question: 'Why was Wegener\'s continental drift hypothesis initially rejected?',
        options: [
          'A. His fossil evidence was found to be inaccurate',
          'B. Scientists already had a competing theory that was widely accepted',
          'C. He could not provide a satisfactory explanation for how continents moved',
          'D. The coastline similarities he described were minor and unconvincing'
        ],
        correct_answer: 2,
        explanation: 'The passage states Wegener\'s hypothesis "was rejected by the scientific community partly because he could not explain the mechanism by which continents moved."'
      },
      {
        id: 8, section: 'Reading Passage 2', type: 'vocabulary',
        passage: null,
        question: 'The word "subducted" in paragraph 4 is closest in meaning to:',
        options: ['A. lifted upward', 'B. pushed beneath', 'C. slid sideways', 'D. broken apart'],
        correct_answer: 1,
        explanation: 'Subduction refers to the process where one tectonic plate is pushed beneath another, descending back into the mantle.'
      },
      {
        id: 9, section: 'Reading Passage 2', type: 'inference',
        passage: null,
        question: 'What can be inferred about the San Andreas Fault from the passage?',
        options: [
          'A. It is formed where two continental plates collide head-on',
          'B. New oceanic crust is continuously created there',
          'C. It produces earthquakes but is not associated with volcanic activity',
          'D. It is an example of a convergent boundary'
        ],
        correct_answer: 2,
        explanation: 'Transform boundaries like the San Andreas Fault generate "frequent earthquakes but no new crust," and the passage does not link them to volcanic activity.'
      },
      {
        id: 10, section: 'Reading Passage 2', type: 'factual-detail',
        passage: null,
        question: 'According to the passage, what confirmed that seafloor spreading was occurring?',
        options: [
          'A. The discovery of identical fossils on separate continents',
          'B. Symmetrical patterns of magnetic anomalies in ocean-floor rocks',
          'C. The visible fit between South American and African coastlines',
          'D. Direct observation of magma rising at subduction zones'
        ],
        correct_answer: 1,
        explanation: 'The passage states "symmetrical patterns of magnetic anomalies recorded in ocean-floor rocks confirmed that seafloor spreading was occurring at measurable rates."'
      },
      {
        id: 11, section: 'Listening — Lecture', type: 'main-idea',
        passage: `Professor: Good morning, everyone. Today I want to talk about photosynthesis — not just the chemical equation you memorised in school, but the actual complexity of what's happening inside a plant cell. So, photosynthesis is often summarised as: plants take in carbon dioxide and water, use sunlight, and produce glucose and oxygen. But this summary barely scratches the surface.\n\nPhotosynthesis occurs in two main stages. The first is called the light-dependent reactions, which take place in the thylakoid membranes of the chloroplast. Here, chlorophyll — the green pigment — absorbs light energy. This energy is used to split water molecules, releasing oxygen as a byproduct. The energy is also stored temporarily in molecules called ATP and NADPH.\n\nThe second stage is the Calvin cycle, or light-independent reactions, which occur in the stroma of the chloroplast. Here, the energy stored in ATP and NADPH is used to convert carbon dioxide into glucose through a series of enzymatic reactions. The key enzyme involved is called RuBisCO — and interestingly, it's probably the most abundant protein on Earth by mass.\n\nNow, why does this matter beyond biology class? Well, understanding photosynthesis efficiency has enormous implications for agriculture and for addressing climate change. Most crop plants — wheat, rice, corn — use a pathway called C3 photosynthesis, which is relatively inefficient under hot, dry conditions. Some plants like sugarcane use C4 photosynthesis, which is significantly more efficient. Scientists are actively working on engineering C4 traits into C3 crops — a project that could substantially increase food production with less water.`,
        question: 'What is the main topic of this lecture?',
        options: [
          'A. The history of photosynthesis research',
          'B. How plants adapt to hot and dry climates',
          'C. The detailed process and significance of photosynthesis',
          'D. Differences between C3 and C4 plants only'
        ],
        correct_answer: 2,
        explanation: 'The lecture covers both stages of photosynthesis in detail and connects this understanding to agricultural and climate implications.'
      },
      {
        id: 12, section: 'Listening — Lecture', type: 'factual-detail',
        passage: null,
        question: 'According to the professor, where do the light-dependent reactions take place?',
        options: [
          'A. In the stroma of the chloroplast',
          'B. In the thylakoid membranes of the chloroplast',
          'C. In the mitochondria of the plant cell',
          'D. On the surface of chlorophyll molecules'
        ],
        correct_answer: 1,
        explanation: 'The professor states the light-dependent reactions "take place in the thylakoid membranes of the chloroplast."'
      },
      {
        id: 13, section: 'Listening — Lecture', type: 'inference',
        passage: null,
        question: 'What can be inferred about engineering C4 traits into C3 crops?',
        options: [
          'A. This has already been successfully achieved for wheat production',
          'B. It would reduce the need for irrigation in agricultural settings',
          'C. It would make crops less resistant to disease',
          'D. Scientists believe this goal is not achievable'
        ],
        correct_answer: 1,
        explanation: 'C4 photosynthesis is "more efficient under hot, dry conditions" and requires "less water," implying engineered crops would need less irrigation.'
      },
      {
        id: 14, section: 'Listening — Lecture', type: 'speaker-attitude',
        passage: null,
        question: "What is the professor's attitude toward the topic of photosynthesis efficiency?",
        options: [
          'A. Dismissive, suggesting the topic is already well understood',
          'B. Cautious, warning that further research may be harmful',
          'C. Enthusiastic, emphasising its broad practical importance',
          'D. Neutral, presenting only historical facts without commentary'
        ],
        correct_answer: 2,
        explanation: 'The professor says understanding photosynthesis "has enormous implications" for agriculture and climate change, reflecting enthusiasm about its importance.'
      },
      {
        id: 15, section: 'Listening — Discussion', type: 'main-point',
        passage: `Professor Chen: Alright, let's pick up where we left off on renewable energy. Last time we discussed solar and wind. Today I'd like you to consider the concept of energy storage. Maya, what do you think is the biggest challenge with renewable energy right now?\n\nMaya: Well, I think it's definitely the intermittency problem. Solar panels don't generate electricity at night, and wind turbines don't work when there's no wind. So even if we build enough renewable capacity, we still need a way to store that energy.\n\nProfessor Chen: Exactly. And what solutions are people proposing? James?\n\nJames: Lithium-ion batteries are the obvious answer — they're already used in electric vehicles. But the problem is scaling them up to grid level is incredibly expensive. And there are concerns about mining lithium and cobalt, which have significant environmental costs.\n\nProfessor Chen: Good points. There are also other approaches being explored — pumped hydro storage, where you pump water uphill and release it to generate power when needed. It's actually the most widely used form of grid storage today. And there's research into hydrogen — using surplus renewable electricity to split water into hydrogen, which can then be burned or used in fuel cells.\n\nMaya: So it sounds like there's no single solution — we need a mix of storage technologies depending on the geography and infrastructure of each region.\n\nProfessor Chen: That's a very mature observation, Maya. Different contexts will require different solutions, and flexibility in approach is essential.`,
        question: 'What is the main subject of this classroom discussion?',
        options: [
          'A. The economic costs of building solar and wind farms',
          'B. Energy storage challenges and solutions for renewable energy',
          'C. The environmental damage caused by lithium mining',
          'D. Why pumped hydro storage is superior to battery storage'
        ],
        correct_answer: 1,
        explanation: 'The discussion centres on the challenge of storing renewable energy and the various technological approaches being explored to address it.'
      },
      {
        id: 16, section: 'Listening — Discussion', type: 'student-opinion',
        passage: null,
        question: 'According to James, what is one problem with scaling up lithium-ion batteries for grid use?',
        options: [
          'A. The technology is too new and unproven',
          'B. They cannot store enough energy for electric vehicles',
          'C. The cost is very high and there are environmental concerns about mining',
          'D. Governments do not yet provide subsidies for battery storage'
        ],
        correct_answer: 2,
        explanation: 'James says scaling up lithium-ion batteries "is incredibly expensive" and raises concerns about "mining lithium and cobalt, which have significant environmental costs."'
      },
      {
        id: 17, section: 'Listening — Discussion', type: 'factual-detail',
        passage: null,
        question: 'According to the professor, which form of energy storage is most widely used for the grid today?',
        options: [
          'A. Lithium-ion batteries', 'B. Hydrogen fuel cells',
          'C. Pumped hydro storage', 'D. Solar thermal storage'
        ],
        correct_answer: 2,
        explanation: 'Professor Chen states pumped hydro storage "is actually the most widely used form of grid storage today."'
      },
      {
        id: 18, section: 'Listening — Discussion', type: 'implied-meaning',
        passage: null,
        question: "When the professor says Maya's observation is 'very mature,' what does the professor mean?",
        options: [
          'A. Maya has demonstrated advanced knowledge for her age',
          'B. Maya\'s comment reflects sophisticated, nuanced thinking',
          'C. The professor is surprised that Maya spoke up',
          'D. Maya\'s point was too complex for the other students'
        ],
        correct_answer: 1,
        explanation: '"Mature observation" in academic context means the thinking is nuanced and sophisticated — recognising that complex problems require flexible, context-dependent solutions.'
      },
      {
        id: 19, section: 'Writing', type: 'integrated-writing',
        passage: 'Some researchers argue that nuclear energy should play a central role in addressing climate change. They contend that nuclear power plants produce minimal greenhouse gas emissions during operation, can generate electricity reliably regardless of weather conditions, and occupy far less land than equivalent solar or wind installations. Proponents suggest that modern reactor designs are significantly safer than older models, making the risks manageable.',
        question: 'Integrated Writing Task (minimum 150 words): Summarize the points made in the listening lecture and explain how they cast doubt on, support, or relate to the specific points made in the reading passage above.',
        options: [],
        correct_answer: -1,
        explanation: ''
      },
      {
        id: 20, section: 'Writing', type: 'academic-discussion',
        passage: null,
        question: `Academic Discussion Task (minimum 100 words):\n\nProfessor Rivera: This week we are discussing whether governments should prioritize renewable energy investment even when it is more expensive than fossil fuels in the short term. What do you think?\n\nAlex: I believe governments must invest now because climate change is an urgent crisis. Short-term costs are worth long-term environmental and economic benefits.\n\nSofia: I understand the urgency, but in developing countries, affordable energy access is the immediate priority. Forcing expensive renewables on poor populations could slow economic growth.\n\nWrite your own contribution to this discussion. Add a new perspective or support one of the existing views with reasons and examples.`,
        options: [],
        correct_answer: -1,
        explanation: ''
      },
    ];
  }

  // ─── TOEFL Fallback Set 1: Archaeology · Ocean Currents · Urban Heat ─────────
  private toeflFallback1(): ExamQuestion[] {
    return [
      {
        id: 1, section: 'Reading Passage 1', type: 'main-idea',
        passage: `Archaeologists study the human past through the systematic recovery and analysis of material remains — tools, pottery, buildings, plant and animal remains, and human skeletal material. Unlike historians, who rely primarily on written records, archaeologists can investigate cultures and periods that left no written documentation, extending our knowledge of human history back hundreds of thousands of years.\n\nExcavation remains the central technique of archaeology. Sites are divided into grids and excavated layer by layer, with each layer representing a different time period. Artefacts are recorded in three-dimensional space relative to their surrounding matrix of soil, enabling archaeologists to reconstruct the context in which they were originally deposited. This contextual information is often as informative as the objects themselves — a decorated ceramic vessel found in a burial context tells a very different story from the same vessel found in domestic rubbish.\n\nDating techniques are central to archaeological interpretation. Stratigraphy — the principle that lower layers are older — provides relative dating. Absolute dating methods, which assign calendar dates to material, include radiocarbon dating (effective for organic material up to about 50,000 years old), dendrochronology (counting tree rings in preserved timber), and luminescence dating (measuring when minerals were last exposed to heat or light).\n\nRecent decades have seen a digital revolution in archaeological practice. Ground-penetrating radar and LiDAR (Light Detection and Ranging) allow archaeologists to identify buried structures without excavation. LiDAR has proved especially transformative in forested environments — in 2018, researchers used airborne LiDAR to reveal the full extent of the Mayan city of Caracol beneath the jungle canopy, revealing a far larger and more densely populated settlement than previously understood.`,
        question: 'What is the main purpose of this passage?',
        options: [
          'A. To compare archaeological methods used in different world regions',
          'B. To argue that LiDAR is the most important advancement in archaeology',
          'C. To provide an overview of how archaeologists study the human past',
          'D. To explain why written records are insufficient for historical research'
        ],
        correct_answer: 2,
        explanation: 'The passage covers excavation, dating techniques, and technology — all under the umbrella of how archaeologists recover and interpret the past.'
      },
      {
        id: 2, section: 'Reading Passage 1', type: 'vocabulary',
        passage: null,
        question: 'The word "matrix" in paragraph 2 is closest in meaning to:',
        options: ['A. grid pattern', 'B. surrounding material', 'C. database record', 'D. layer boundary'],
        correct_answer: 1,
        explanation: 'In archaeological context, "matrix" refers to the surrounding soil or material in which artefacts are embedded.'
      },
      {
        id: 3, section: 'Reading Passage 1', type: 'factual-detail',
        passage: null,
        question: 'According to the passage, what is the effective age range for radiocarbon dating?',
        options: ['A. Up to 10,000 years', 'B. Up to 50,000 years', 'C. Up to 100,000 years', 'D. Up to 1 million years'],
        correct_answer: 1,
        explanation: 'The passage states radiocarbon dating is "effective for organic material up to about 50,000 years old."'
      },
      {
        id: 4, section: 'Reading Passage 1', type: 'inference',
        passage: null,
        question: 'What can be inferred from the LiDAR discovery at Caracol?',
        options: [
          'A. Earlier archaeologists had deliberately misrepresented the size of the city',
          'B. Forest environments may conceal archaeological sites of unexpected scale',
          'C. LiDAR is only useful in tropical rainforest settings',
          'D. The Mayan civilisation was more advanced than any other ancient culture'
        ],
        correct_answer: 1,
        explanation: 'Caracol was "far larger and more densely populated than previously understood" once the jungle canopy was penetrated — implying forests can hide extensive settlements.'
      },
      {
        id: 5, section: 'Reading Passage 1', type: 'purpose',
        passage: null,
        question: 'Why does the author mention the ceramic vessel found in two different contexts?',
        options: [
          'A. To show that pottery styles changed over time',
          'B. To illustrate how context shapes the interpretation of artefacts',
          'C. To argue that burial goods are more valuable than domestic items',
          'D. To explain the process of three-dimensional recording'
        ],
        correct_answer: 1,
        explanation: 'The example demonstrates that the same object carries different meaning depending on its contextual position — a key point about archaeological interpretation.'
      },
      {
        id: 6, section: 'Reading Passage 2', type: 'main-idea',
        passage: `Ocean currents are continuous, directed movements of seawater driven by several forces including wind, water density differences, the Coriolis effect, and tidal forces. They play a fundamental role in regulating Earth's climate by redistributing heat from the tropics toward the poles and transporting oxygen and nutrients to marine ecosystems. Scientists distinguish between surface currents, which affect roughly the top 400 metres of the ocean and are primarily wind-driven, and deep-water currents, which are driven by differences in water density related to temperature and salinity.\n\nThe global thermohaline circulation — often called the ocean conveyor belt — connects surface and deep-water currents into a single, planet-spanning system. Cold, salty, dense water sinks in high-latitude regions such as the North Atlantic and around Antarctica, driving deep-water flow. This water slowly circulates through the ocean basins before eventually upwelling in other regions. The complete circuit may take over 1,000 years to complete.\n\nThe thermohaline circulation has profound effects on regional climates. The Gulf Stream, a component of the North Atlantic circulation, carries warm tropical water northward, moderating the climate of Northwestern Europe. Without this current, temperatures in cities like London and Oslo might be 5–10 degrees Celsius colder. Scientists have expressed concern that increased freshwater input from melting Arctic ice could weaken the thermohaline circulation by reducing the salinity — and therefore the density — of North Atlantic surface waters, potentially disrupting regional climate patterns.\n\nEl Niño is another example of ocean current variability with major climatic consequences. Under normal conditions, trade winds push warm surface water westward across the Pacific. During El Niño events, these winds weaken, allowing warm water to slosh back toward South America. The resulting changes in sea surface temperature can cause droughts in Australia, floods in South America, and altered monsoon patterns across Asia — demonstrating the far-reaching influence of ocean dynamics on global weather.`,
        question: 'What is the main idea of this passage?',
        options: [
          'A. The thermohaline circulation is the only important ocean current system',
          'B. Ocean currents regulate climate and have wide-ranging environmental effects',
          'C. El Niño events cause more damage than any other climate phenomenon',
          'D. Deep-water currents are more important than surface currents for climate'
        ],
        correct_answer: 1,
        explanation: 'The passage covers surface and deep currents, thermohaline circulation, Gulf Stream, and El Niño — all illustrating the broad climatic roles of ocean currents.'
      },
      {
        id: 7, section: 'Reading Passage 2', type: 'factual-detail',
        passage: null,
        question: 'According to the passage, what drives deep-water ocean currents?',
        options: [
          'A. Wind patterns at the ocean surface',
          'B. Tidal forces from the moon',
          'C. Differences in water temperature and salinity',
          'D. Volcanic activity on the ocean floor'
        ],
        correct_answer: 2,
        explanation: 'Deep-water currents "are driven by differences in water density related to temperature and salinity," according to the passage.'
      },
      {
        id: 8, section: 'Reading Passage 2', type: 'vocabulary',
        passage: null,
        question: 'The word "upwelling" in paragraph 2 is closest in meaning to:',
        options: ['A. sinking deeper', 'B. rising to the surface', 'C. flowing sideways', 'D. freezing in place'],
        correct_answer: 1,
        explanation: 'Upwelling refers to the process by which deep water rises toward the surface — the reverse of the sinking that occurs in cold, dense regions.'
      },
      {
        id: 9, section: 'Reading Passage 2', type: 'inference',
        passage: null,
        question: 'What can be inferred about the potential weakening of the thermohaline circulation?',
        options: [
          'A. It would benefit regions currently cooled by the Gulf Stream',
          'B. Northwestern Europe could experience significantly colder temperatures',
          'C. Melting Arctic ice would have no effect on ocean salinity',
          'D. El Niño events would disappear if the thermohaline circulation slowed'
        ],
        correct_answer: 1,
        explanation: 'The Gulf Stream warms Northwestern Europe by 5–10°C; if thermohaline circulation weakened and this current slowed, those regions would become much colder.'
      },
      {
        id: 10, section: 'Reading Passage 2', type: 'factual-detail',
        passage: null,
        question: 'During a normal (non-El Niño) year, what direction do trade winds push warm Pacific water?',
        options: ['A. Northward toward Alaska', 'B. Westward', 'C. Eastward toward South America', 'D. Southward toward Antarctica'],
        correct_answer: 1,
        explanation: 'The passage states "trade winds push warm surface water westward across the Pacific" under normal conditions.'
      },
      {
        id: 11, section: 'Listening — Lecture', type: 'main-idea',
        passage: `Professor: Today I'd like to explore the concept of the urban heat island effect — a phenomenon that's becoming increasingly relevant as more of the world's population moves into cities. So, what is an urban heat island? Simply put, it refers to the observation that urban areas are measurably warmer than surrounding rural areas, even when controlling for regional climate. The difference can be as large as 5 to 10 degrees Celsius on calm, clear nights.\n\nWhy does this happen? Several factors contribute. First, urban surfaces — roads, rooftops, parking lots — are largely covered in dark, impermeable materials like asphalt and concrete. These materials absorb solar radiation during the day and release it slowly as heat at night. Rural areas, in contrast, have more vegetation, which reflects more sunlight and also cools the air through evapotranspiration — the process by which plants release water vapour.\n\nSecond, the geometry of cities matters. Tall buildings create narrow street canyons that trap heat and reduce wind circulation. The reduced wind speed limits the dispersal of both heat and air pollutants.\n\nThird, human activities themselves generate heat — from vehicles, air conditioning, industry, and even the metabolism of millions of people. This anthropogenic heat load adds substantially to urban temperatures.\n\nSo what can be done? Urban planners are exploring several strategies: green roofs and walls covered in vegetation, cool pavements that reflect more sunlight, and strategic planting of urban trees. Research suggests that increasing urban tree cover by 10% can reduce peak temperatures by 1 to 2 degrees — modest, but meaningful for public health.`,
        question: "What is the professor's lecture mainly about?",
        options: [
          'A. How climate change is causing temperatures to rise globally',
          'B. The causes and potential solutions for the urban heat island effect',
          'C. Why rural areas are cooler than cities due to agricultural practices',
          'D. The economic costs of installing green roofs in major cities'
        ],
        correct_answer: 1,
        explanation: 'The lecture explains what urban heat islands are, the factors causing them, and urban planning strategies to address the problem.'
      },
      {
        id: 12, section: 'Listening — Lecture', type: 'factual-detail',
        passage: null,
        question: 'According to the professor, what is "evapotranspiration"?',
        options: [
          'A. The absorption of solar radiation by dark urban surfaces',
          'B. The release of water vapour by plants that cools the air',
          'C. The process by which concrete stores heat overnight',
          'D. The movement of heat upward through tall buildings'
        ],
        correct_answer: 1,
        explanation: 'The professor defines evapotranspiration as "the process by which plants release water vapour," which cools the surrounding air.'
      },
      {
        id: 13, section: 'Listening — Lecture', type: 'factual-detail',
        passage: null,
        question: 'How does urban geometry contribute to the heat island effect?',
        options: [
          'A. Tall buildings reflect more sunlight than shorter ones',
          'B. Street canyons trap heat and reduce wind circulation',
          'C. Wide boulevards prevent air pollutants from dispersing',
          'D. Urban geometry has no direct effect on temperature'
        ],
        correct_answer: 1,
        explanation: 'The professor explains that "tall buildings create narrow street canyons that trap heat and reduce wind circulation."'
      },
      {
        id: 14, section: 'Listening — Lecture', type: 'inference',
        passage: null,
        question: 'Based on the lecture, what would most likely reduce the urban heat island effect?',
        options: [
          'A. Replacing asphalt roads with concrete ones',
          'B. Increasing the height of downtown buildings',
          'C. Planting more trees throughout the city',
          'D. Banning the use of air conditioning in summer'
        ],
        correct_answer: 2,
        explanation: 'The professor specifically mentions that increasing urban tree cover by 10% can reduce peak temperatures, making tree planting the most directly supported strategy.'
      },
      {
        id: 15, section: 'Listening — Discussion', type: 'main-point',
        passage: `Professor Kim: Good afternoon. Last week you read about migration — today I'd like to discuss whether governments should implement stricter border policies in response to large migration flows. Let's get different perspectives. What do you think, Carlos?\n\nCarlos: I think we have to separate economic migrants from refugees. People fleeing war or persecution have a right to protection under international law. But for economic migrants, nations do have the right to control who enters — especially when social services are under strain.\n\nProfessor Kim: Interesting distinction. Lena, do you agree with that separation?\n\nLena: Not entirely. The distinction is artificial in practice — many people move because of a combination of poverty, violence, and climate disruption. Applying rigid legal categories can deny protection to people with genuine needs. I think we need more flexible humanitarian frameworks.\n\nProfessor Kim: That raises an important point about climate migration. By some estimates, hundreds of millions of people could be displaced by climate change by 2050, but they don't fit neatly into the existing legal definition of "refugee." Carlos, how would you respond?\n\nCarlos: That's a real challenge. I guess we do need to update international frameworks. But even so, receiving countries need practical limits — you can't have open borders without straining public services.\n\nProfessor Kim: So it seems we all agree that current frameworks are inadequate, even if we differ on solutions. That tension between humanitarian obligations and practical constraints is at the heart of this debate.`,
        question: 'What is the primary focus of this discussion?',
        options: [
          'A. Whether climate change is the main driver of global migration',
          'B. How governments should respond to large migration flows',
          'C. The difference between refugees and temporary workers',
          'D. Why international law has failed to protect refugees'
        ],
        correct_answer: 1,
        explanation: 'The discussion centres on government responses to migration flows, with students and professor debating border policies, legal categories, and humanitarian frameworks.'
      },
      {
        id: 16, section: 'Listening — Discussion', type: 'student-opinion',
        passage: null,
        question: "What is Lena's main criticism of Carlos's view?",
        options: [
          'A. Carlos is wrong to suggest that economic migrants deserve any rights',
          'B. The distinction between refugees and economic migrants is too rigid for real-world cases',
          'C. International law already provides adequate protection for all migrants',
          'D. Climate migration should not be considered in immigration discussions'
        ],
        correct_answer: 1,
        explanation: 'Lena argues the distinction "is artificial in practice" because many people move due to combined reasons, making rigid legal categories potentially harmful.'
      },
      {
        id: 17, section: 'Listening — Discussion', type: 'implied-meaning',
        passage: null,
        question: "When the professor says 'it seems we all agree that current frameworks are inadequate,' what is the professor suggesting?",
        options: [
          'A. Both students have identical policy positions',
          'B. Despite their differences, both students share a common conclusion about existing law',
          'C. The professor disagrees with both students',
          'D. International refugee law was designed specifically for climate migrants'
        ],
        correct_answer: 1,
        explanation: 'Both Carlos and Lena, despite their different emphases, acknowledge that current legal frameworks need updating — a common ground the professor identifies.'
      },
      {
        id: 18, section: 'Listening — Discussion', type: 'factual-detail',
        passage: null,
        question: 'According to the professor, what challenge do climate migrants face under current refugee law?',
        options: [
          'A. They are required to apply for asylum in their home country first',
          'B. They do not fit the existing legal definition of "refugee"',
          'C. They are legally classified as economic migrants by all nations',
          'D. International courts have repeatedly ruled against climate migration claims'
        ],
        correct_answer: 1,
        explanation: 'The professor notes that climate-displaced people "don\'t fit neatly into the existing legal definition of \'refugee\'" — leaving them without clear legal protection.'
      },
      {
        id: 19, section: 'Writing', type: 'integrated-writing',
        passage: 'Many urban planners and environmentalists advocate for rewilding cities — allowing natural vegetation to reclaim degraded urban land and restoring ecological corridors to connect green spaces. Proponents argue this approach reduces the urban heat island effect, improves air quality, increases biodiversity, and provides residents with psychological benefits associated with contact with nature. Some cities in Europe and North America have begun small-scale rewilding projects with promising results.',
        question: 'Integrated Writing Task (minimum 150 words): Summarize the points made in the listening lecture about urban heat and explain how those points relate to the benefits of urban rewilding described in the reading passage.',
        options: [],
        correct_answer: -1,
        explanation: ''
      },
      {
        id: 20, section: 'Writing', type: 'academic-discussion',
        passage: null,
        question: `Academic Discussion Task (minimum 100 words):\n\nProfessor Tanaka: This week we are discussing whether cities should prioritise economic growth or environmental sustainability when making urban development decisions. What is your view?\n\nMia: I think these goals don't have to be opposites. Green infrastructure like parks and clean energy can actually attract investment and create jobs.\n\nDaniel: I agree in principle, but in practice, developing cities face immediate poverty issues that often take precedence over long-term environmental planning.\n\nWrite your own contribution to this discussion, adding a new argument or extending one of the existing viewpoints with reasons and examples.`,
        options: [],
        correct_answer: -1,
        explanation: ''
      },
    ];
  }

  // ─── IELTS Fallback Set 0: Library · Museum · Bioluminescence ────────────────
  private ieltsFallback0(): ExamQuestion[] {
    return [
      {
        id: 1, section: 'Listening Part 1', type: 'note-completion',
        passage: `Receptionist: Good morning, City Library. How can I help you?\nStudent: Hi, I'd like to join the library. Can I do that today?\nReceptionist: Of course! I just need a few details. Your full name?\nStudent: Sarah Mitchell.\nReceptionist: And your date of birth?\nStudent: 14th March 1999.\nReceptionist: Great. Your address?\nStudent: 27 Ferndale Road, Bristol.\nReceptionist: Phone number?\nStudent: 07742 115 883.\nReceptionist: Perfect. Your membership card will be ready in about ten minutes. The annual fee is twelve pounds fifty. Will you be paying by card or cash?\nStudent: By card, please.\nReceptionist: And your PIN will be your date of birth — the day and month, so 1403.`,
        question: 'Complete the note. The library membership annual fee is _____.',
        options: ['A. £10.00', 'B. £12.50', 'C. £15.00', 'D. £20.00'],
        correct_answer: 1,
        explanation: 'The receptionist states "The annual fee is twelve pounds fifty" — £12.50.'
      },
      {
        id: 2, section: 'Listening Part 1', type: 'note-completion',
        passage: null,
        question: "Complete the note. The student's address is _____ Ferndale Road.",
        options: ['A. 17', 'B. 21', 'C. 27', 'D. 37'],
        correct_answer: 2,
        explanation: 'The student says "27 Ferndale Road, Bristol."'
      },
      {
        id: 3, section: 'Listening Part 1', type: 'multiple-choice',
        passage: null,
        question: 'How will the student pay the membership fee?',
        options: ['A. Cash', 'B. Cheque', 'C. Bank transfer', 'D. Card'],
        correct_answer: 3,
        explanation: 'The student says "By card, please."'
      },
      {
        id: 4, section: 'Listening Part 1', type: 'true-false-not-given',
        passage: null,
        question: "The student's PIN consists of her year of birth.",
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 1,
        explanation: 'The receptionist says the PIN is "the day and month" — 1403, not the year. So the statement is False.'
      },
      {
        id: 5, section: 'Listening Part 2', type: 'multiple-choice',
        passage: `Welcome to the Harwood Science Museum. Today's guided tour will begin at 10:30 in the main atrium. The tour covers three floors and lasts approximately ninety minutes. Photography is permitted throughout the museum, but please ensure your flash is turned off in the fossil gallery on the second floor, as this can damage the specimens. Refreshments are available in the basement café, which opens at eleven. The gift shop closes at four-thirty today, thirty minutes earlier than usual, due to a private event this evening. If you have any questions during the tour, please direct them to your guide, not to the security staff.`,
        question: 'Why is flash photography prohibited in the fossil gallery?',
        options: [
          'A. It disturbs other visitors',
          'B. It can damage the specimens',
          'C. It is against museum policy',
          'D. The lighting is already sufficient'
        ],
        correct_answer: 1,
        explanation: 'The announcement states flash "can damage the specimens" in the fossil gallery.'
      },
      {
        id: 6, section: 'Listening Part 2', type: 'multiple-choice',
        passage: null,
        question: 'What time does the gift shop close today?',
        options: ['A. 4:00 pm', 'B. 4:30 pm', 'C. 5:00 pm', 'D. 5:30 pm'],
        correct_answer: 1,
        explanation: 'The announcement says the gift shop closes at "four-thirty today, thirty minutes earlier than usual."'
      },
      {
        id: 7, section: 'Listening Part 2', type: 'multiple-choice',
        passage: null,
        question: 'Where should visitors ask questions during the tour?',
        options: [
          'A. At the information desk',
          'B. To the security staff',
          'C. To the tour guide',
          'D. At the gift shop'
        ],
        correct_answer: 2,
        explanation: 'The announcement says to direct questions "to your guide, not to the security staff."'
      },
      {
        id: 8, section: 'Reading', type: 'note-completion',
        passage: `Bioluminescence is the production and emission of light by living organisms through a chemical reaction. The phenomenon occurs in a wide range of species including bacteria, fungi, jellyfish, fireflies, and deep-sea fish. The light is produced when a compound called luciferin is oxidised with the help of an enzyme known as luciferase. Unlike a conventional light bulb, which converts only around 5% of energy into visible light and loses the rest as heat, bioluminescent reactions are highly efficient, converting up to 98% of energy directly into light with virtually no heat generated. This is why bioluminescence is sometimes called "cold light."\n\nIn marine environments, bioluminescence serves multiple functions. Predators such as the anglerfish use a glowing lure to attract prey in the pitch-dark depths of the ocean. Other creatures, like certain squid species, emit light on their undersides to match the faint light filtering from above — a camouflage technique called counter-illumination, which makes them nearly invisible to predators below. Some organisms flash light as a warning to deter predators, while bacteria may use it to attract a host organism in which they can live symbiotically.\n\nOn land, the firefly is perhaps the most familiar example. Fireflies use rhythmic flashes of light as mating signals — each species has a unique flash pattern that enables individuals to identify suitable mates. Scientists have observed over 170 species of fireflies in North America alone. Alarmingly, firefly populations are declining in many regions due to light pollution, habitat loss, and pesticide use. Researchers warn that if current trends continue, some species could face extinction within decades.\n\nThe study of bioluminescence has led to valuable scientific applications. Luciferase is now widely used as a "reporter gene" in biomedical research, allowing scientists to track biological processes inside living cells in real time. More recently, researchers have explored the possibility of using bioluminescent plants as a sustainable alternative to electric street lighting, though this technology remains experimental.`,
        question: 'Complete the note: Bioluminescent reactions are efficient, converting up to 98% of energy into _____ with almost no heat.',
        options: ['A. electricity', 'B. light', 'C. oxygen', 'D. warmth'],
        correct_answer: 1,
        explanation: 'The passage states bioluminescent reactions convert "up to 98% of energy directly into light with virtually no heat generated."'
      },
      {
        id: 9, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note: The enzyme that helps produce bioluminescent light is called _____.',
        options: ['A. luciferin', 'B. luciferase', 'C. oxidase', 'D. chlorophyll'],
        correct_answer: 1,
        explanation: 'The passage states "an enzyme known as luciferase" is involved in the reaction.'
      },
      {
        id: 10, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note: The camouflage technique used by squid to hide from predators below is called _____.',
        options: ['A. bioluminescence', 'B. counter-illumination', 'C. deep-sea camouflage', 'D. photo-mimicry'],
        correct_answer: 1,
        explanation: 'The passage explicitly names this technique "counter-illumination."'
      },
      {
        id: 11, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note: Fireflies use rhythmic flashes as _____ signals to attract mates.',
        options: ['A. warning', 'B. hunting', 'C. mating', 'D. distress'],
        correct_answer: 2,
        explanation: 'The passage says "Fireflies use rhythmic flashes of light as mating signals."'
      },
      {
        id: 12, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note: Luciferase is used in biomedical research as a _____ gene to track biological processes.',
        options: ['A. reporter', 'B. marker', 'C. synthetic', 'D. control'],
        correct_answer: 0,
        explanation: 'The passage states luciferase is "used as a \'reporter gene\' in biomedical research."'
      },
      {
        id: 13, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'Bioluminescent reactions produce more heat than conventional light bulbs.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 1,
        explanation: 'The passage says bioluminescent reactions produce "virtually no heat" — the opposite of the statement. False.'
      },
      {
        id: 14, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'The anglerfish uses its bioluminescent lure to attract other anglerfish for mating.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 1,
        explanation: 'The passage states the anglerfish uses a glowing lure "to attract prey" — not for mating. False.'
      },
      {
        id: 15, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'Scientists have recorded over 170 firefly species in North America.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 0,
        explanation: 'The passage states "Scientists have observed over 170 species of fireflies in North America alone." True.'
      },
      {
        id: 16, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'Bioluminescent street lighting technology is currently available to the public.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 1,
        explanation: 'The passage says this "technology remains experimental" — so it is not yet publicly available. False.'
      },
      {
        id: 17, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'Firefly populations are declining partly as a result of the use of pesticides.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 0,
        explanation: 'The passage explicitly mentions "pesticide use" as one of the causes of firefly population decline. True.'
      },
      {
        id: 18, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'Some firefly species may become extinct within the next ten years if current trends continue.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 2,
        explanation: 'The passage says "within decades" — it does not specify "ten years." The statement cannot be verified from the text. Not Given.'
      },
      {
        id: 19, section: 'Writing', type: 'writing-task1',
        passage: '{"type":"bar-grouped","title":"Adults Using Online Banking in Four Countries (2010 vs 2020)","yLabel":"% of Adults","yMax":100,"note":"Source: European Banking Authority","categories":["UK","Germany","France","Spain"],"series":[{"name":"2010","color":"#818cf8","values":[52,38,34,22]},{"name":"2020","color":"#4f46e5","values":[87,71,65,48]}]}',
        question: 'Task 1 — minimum 150 words: The bar chart compares the percentage of adults using online banking in four European countries in 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        options: [],
        correct_answer: -1,
        explanation: ''
      },
      {
        id: 20, section: 'Writing', type: 'writing-task2',
        passage: null,
        question: 'Task 2 — minimum 250 words: Some people think that universities should only focus on academic subjects. Others believe that practical skills, such as teamwork, communication, and leadership, should also be taught at university. Discuss both views and give your own opinion.',
        options: [],
        correct_answer: -1,
        explanation: ''
      },
    ];
  }

  // ─── IELTS Fallback Set 1: Medical Clinic · Iceland Travel · Smart Cities ────
  private ieltsFallback1(): ExamQuestion[] {
    return [
      {
        id: 1, section: 'Listening Part 1', type: 'note-completion',
        passage: `Receptionist: Good afternoon, Greenway Medical Centre. How can I help you?\nPatient: Hello, I'd like to register as a new patient, please.\nReceptionist: Of course. Can I take your full name?\nPatient: James Thornton.\nReceptionist: Date of birth?\nPatient: 23rd August 1987.\nReceptionist: And your address?\nPatient: 15 Maple Avenue, Oxford. OX4 2NP.\nReceptionist: Contact number?\nPatient: 07891 334 562.\nReceptionist: Any existing medical conditions?\nPatient: I have mild asthma. I also need to transfer my prescription — it's for a reliever inhaler, Salbutamol.\nReceptionist: Noted. Your first appointment will be with Dr. Chen on Thursday at 2:15. Registration is completely free. You'll receive a confirmation text within the hour.`,
        question: 'Complete the note. The patient lives at number _____ Maple Avenue.',
        options: ['A. 12', 'B. 15', 'C. 17', 'D. 25'],
        correct_answer: 1,
        explanation: 'The patient says "15 Maple Avenue, Oxford."'
      },
      {
        id: 2, section: 'Listening Part 1', type: 'note-completion',
        passage: null,
        question: "Complete the note. The patient's prescription is for a reliever inhaler called _____.",
        options: ['A. Amoxicillin', 'B. Ventolin', 'C. Salbutamol', 'D. Prednisolone'],
        correct_answer: 2,
        explanation: 'The patient says "it\'s for a reliever inhaler, Salbutamol."'
      },
      {
        id: 3, section: 'Listening Part 1', type: 'multiple-choice',
        passage: null,
        question: "When is the patient's first appointment with Dr. Chen?",
        options: ['A. Wednesday at 2:15', 'B. Thursday at 2:00', 'C. Thursday at 2:15', 'D. Friday at 3:15'],
        correct_answer: 2,
        explanation: 'The receptionist says "Your first appointment will be with Dr. Chen on Thursday at 2:15."'
      },
      {
        id: 4, section: 'Listening Part 1', type: 'true-false-not-given',
        passage: null,
        question: 'There is a registration fee at Greenway Medical Centre.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 1,
        explanation: 'The receptionist says "Registration is completely free." The statement is therefore False.'
      },
      {
        id: 5, section: 'Listening Part 2', type: 'multiple-choice',
        passage: `Good evening and welcome to Travel Horizons on Radio National. I'm Laura Briggs. Tonight we're focusing on Iceland — one of the fastest-growing tourist destinations in Europe. Iceland recorded a record 2.3 million visitors last year, remarkable for a country of just 370,000 people. The most popular time to visit is June and July when daylight lasts almost 24 hours. However, for those hoping to see the Northern Lights, visit between September and March. Temperatures in Reykjavik average minus three degrees in January. The most common way to explore is by renting a car and driving the Ring Road, which circles the island at just over 1,300 kilometres. Entry to the Blue Lagoon requires advance booking and costs approximately sixty euros per adult. Don't forget your passport — Icelandic immigration takes documentation seriously even for Schengen visitors.`,
        question: 'What is the main purpose of this radio broadcast?',
        options: [
          'A. To warn about Iceland\'s harsh winter conditions',
          'B. To promote Iceland as a travel destination',
          'C. To compare Iceland with other Scandinavian countries',
          'D. To explain Icelandic immigration requirements'
        ],
        correct_answer: 1,
        explanation: 'The broadcast provides tourist information to encourage visitors to Iceland — it is promotional in nature.'
      },
      {
        id: 6, section: 'Listening Part 2', type: 'multiple-choice',
        passage: null,
        question: 'When is the best time to see the Northern Lights in Iceland?',
        options: ['A. June and July', 'B. July to September', 'C. September to March', 'D. December to February'],
        correct_answer: 2,
        explanation: 'The broadcast states "for those hoping to see the Northern Lights, visit between September and March."'
      },
      {
        id: 7, section: 'Listening Part 2', type: 'multiple-choice',
        passage: null,
        question: 'How much does entry to the Blue Lagoon cost per adult?',
        options: ['A. €40', 'B. €50', 'C. €60', 'D. €75'],
        correct_answer: 2,
        explanation: 'The broadcast says entry "costs approximately sixty euros per adult."'
      },
      {
        id: 8, section: 'Reading', type: 'note-completion',
        passage: `In an era of rapid urbanisation, cities around the world are turning to digital technology to manage challenges of population growth, environmental degradation, and resource depletion. The concept of the 'smart city' — one that uses data and connected devices to optimise urban services — has gained significant traction in public policy over the last decade.\n\nAt its core, a smart city relies on an interconnected network of sensors, cameras, and data-processing systems to collect real-time information about traffic flow, energy consumption, waste management, and public safety. Singapore is frequently cited as a leading example, having deployed thousands of sensors to monitor everything from illegal parking to public hygiene. The data feeds into a centralised command centre where algorithms identify inefficiencies and trigger automated responses.\n\nOne of the most tangible benefits is improved traffic management. Traditional traffic signals operate on fixed cycles regardless of actual demand; smart signals adjust in real time, reducing average commute times by up to 25% in cities where they have been implemented. Barcelona reportedly saved €37 million annually by introducing intelligent irrigation in its parks, drawing on weather data and soil sensors to water only when necessary.\n\nCritics warn of significant risks. Mass collection of data about citizens' movements raises serious privacy concerns. In several Chinese cities, facial recognition cameras monitor compliance with traffic laws — a development human rights organisations argue constitutes mass surveillance. Smart city infrastructure is also expensive, and benefits are often concentrated in wealthier districts, potentially widening existing inequalities.\n\nThere is also the question of cybersecurity. In 2021, a hacker briefly gained access to the water treatment system of Oldsmar, Florida, attempting to increase chemical levels to dangerous amounts before the attack was neutralised. Despite these challenges, many urban planners view smart city technology as essential. The United Nations predicts that 68% of the global population will live in cities by 2050, making efficient urban management a necessity.`,
        question: 'Complete the note. Smart city technology uses _____ to collect real-time data about urban services.',
        options: ['A. AI drones', 'B. sensors and connected devices', 'C. satellite imaging', 'D. citizen reporting apps'],
        correct_answer: 1,
        explanation: 'The passage states smart cities rely on "an interconnected network of sensors, cameras, and data-processing systems."'
      },
      {
        id: 9, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note. In Singapore, sensor data is processed in a _____ command centre.',
        options: ['A. distributed', 'B. decentralised', 'C. centralised', 'D. regional'],
        correct_answer: 2,
        explanation: 'The passage says "data feeds into a centralised command centre."'
      },
      {
        id: 10, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note. Smart traffic signals can reduce average commute times by up to _____.',
        options: ['A. 15%', 'B. 20%', 'C. 25%', 'D. 30%'],
        correct_answer: 2,
        explanation: 'The passage states smart signals reduce "average commute times by up to 25%."'
      },
      {
        id: 11, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note. Barcelona saves money using intelligent _____ in its parks based on sensor data.',
        options: ['A. lighting', 'B. transport', 'C. irrigation', 'D. surveillance'],
        correct_answer: 2,
        explanation: 'The passage mentions "intelligent irrigation in its parks, drawing on weather data and soil sensors."'
      },
      {
        id: 12, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note. Critics argue that facial recognition cameras in cities constitute mass _____.',
        options: ['A. communication', 'B. surveillance', 'C. administration', 'D. enforcement'],
        correct_answer: 1,
        explanation: 'The passage states human rights organisations argue this "constitutes mass surveillance."'
      },
      {
        id: 13, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'Traditional traffic signals change their timing based on real-time vehicle data.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 1,
        explanation: 'The passage states traditional signals "operate on fixed cycles regardless of actual demand" — False.'
      },
      {
        id: 14, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'The United Nations predicts that by 2050, the majority of the global population will live in urban areas.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 0,
        explanation: 'The passage states the UN predicts "68% of the global population will live in cities by 2050." 68% is a majority — True.'
      },
      {
        id: 15, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'The cyberattack on the Oldsmar water treatment facility was successfully executed before being discovered.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 1,
        explanation: 'The passage says the attack was "neutralised" before harm — the statement is False.'
      },
      {
        id: 16, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'Smart city technology tends to benefit all urban districts equally.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 1,
        explanation: 'The passage says "benefits are often concentrated in wealthier districts" — False.'
      },
      {
        id: 17, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'Singapore has used sensor technology to monitor public hygiene.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 0,
        explanation: 'The passage states Singapore monitors "everything from illegal parking to public hygiene." True.'
      },
      {
        id: 18, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'The cost of implementing smart city systems is identical in developed and developing countries.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 2,
        explanation: 'The passage does not compare costs between developed and developing countries — Not Given.'
      },
      {
        id: 19, section: 'Writing', type: 'writing-task1',
        passage: '{"type":"pie","title":"Weekly Study Time Allocation — UK Undergraduates (2023)","note":"Based on a survey of 2,000 full-time students","slices":[{"label":"Mathematics","value":30,"color":"#6366f1"},{"label":"Sciences","value":25,"color":"#8b5cf6"},{"label":"Literature","value":20,"color":"#a855f7"},{"label":"Languages","value":15,"color":"#ec4899"},{"label":"Social Studies","value":10,"color":"#f97316"}]}',
        question: 'Task 1 — minimum 150 words: The pie chart shows how UK university students divide their weekly study time across five subjects. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        options: [],
        correct_answer: -1,
        explanation: ''
      },
      {
        id: 20, section: 'Writing', type: 'writing-task2',
        passage: null,
        question: 'Task 2 — minimum 250 words: Some people believe that governments should invest heavily in smart city technology to improve urban life. Others argue that this money would be better spent on traditional public services such as healthcare and education. Discuss both views and give your own opinion.',
        options: [],
        correct_answer: -1,
        explanation: ''
      },
    ];
  }

  // ─── TOEIC Fallback Set 0: Business Contract · Car Park · Office ─────────────
  private toeicFallback0(): ExamQuestion[] {
    return [
      {
        id: 1, section: 'Listening Part 1', type: 'photograph',
        passage: 'A woman in a blue blazer is standing at a whiteboard in a bright conference room. She is pointing to a pie chart with a marker. Several colleagues are seated around the table facing her.',
        question: 'What is the woman doing?',
        options: [
          'A. She is writing notes at her desk.',
          'B. She is presenting data to colleagues.',
          'C. She is packing files into a bag.',
          'D. She is reading a chart on a laptop.'
        ],
        correct_answer: 1,
        explanation: 'The description shows a woman pointing to a chart while colleagues look at her — she is giving a presentation.'
      },
      {
        id: 2, section: 'Listening Part 1', type: 'photograph',
        passage: 'Two men wearing hard hats and safety vests are standing at a table at a construction site, both looking at large blueprints spread in front of them.',
        question: 'What are the men doing?',
        options: [
          'A. They are operating heavy machinery.',
          'B. They are loading materials onto a truck.',
          'C. They are reviewing construction blueprints.',
          'D. They are painting a wall.'
        ],
        correct_answer: 2,
        explanation: 'Both men are looking at blueprints on a table — they are reviewing construction plans.'
      },
      {
        id: 3, section: 'Listening Part 2', type: 'question-response',
        passage: 'Where should I submit the expense report?',
        question: 'Which response is most appropriate?',
        options: [
          'A. To the finance department by Friday.',
          'B. Because the deadline was yesterday.',
          'C. The manager approved it this morning.'
        ],
        correct_answer: 0,
        explanation: 'Option A directly answers "where" with a location and deadline — the logical response.'
      },
      {
        id: 4, section: 'Listening Part 2', type: 'question-response',
        passage: 'Would you like me to reschedule the client meeting?',
        question: 'Which response is most appropriate?',
        options: [
          'A. The meeting room is on the third floor.',
          'B. Yes, please move it to Thursday afternoon.',
          'C. The client called last week.'
        ],
        correct_answer: 1,
        explanation: 'Option B directly accepts the offer and provides a new time — the most logical response.'
      },
      {
        id: 5, section: 'Listening Part 2', type: 'question-response',
        passage: "When does the new product line launch?",
        question: 'Which response is most appropriate?',
        options: [
          'A. It was designed by the marketing team.',
          'B. On the second floor, next to the showroom.',
          'C. We are targeting early next quarter.'
        ],
        correct_answer: 2,
        explanation: 'Option C answers "when" with a time reference — the appropriate response.'
      },
      {
        id: 6, section: 'Listening Part 3', type: 'conversation',
        passage: `Woman: Hi, David. Did you receive the contract from the Harmon account?\nMan: Yes, it came in this morning. I've reviewed most of it, but the payment terms on page eight seem unusual.\nWoman: In what way?\nMan: They're requesting net-60 instead of our standard net-30. I'll need to check with the finance team before we can approve it.\nWoman: Alright. Can you do that today? We're hoping to sign by end of week.\nMan: I'll contact them right after this meeting.`,
        question: 'What is the main topic of the conversation?',
        options: [
          'A. A delayed product delivery',
          'B. A contract with non-standard payment terms',
          'C. A new employee onboarding process',
          'D. A client complaint about service quality'
        ],
        correct_answer: 1,
        explanation: 'The conversation focuses on the Harmon contract and its unusual payment terms (net-60 vs. standard net-30).'
      },
      {
        id: 7, section: 'Listening Part 3', type: 'conversation',
        passage: null,
        question: 'What does the man say is unusual about the contract?',
        options: [
          'A. The contract is missing a signature.',
          'B. The delivery schedule is too short.',
          'C. The payment terms are net-60 instead of net-30.',
          'D. The price is higher than expected.'
        ],
        correct_answer: 2,
        explanation: 'The man says "they\'re requesting net-60 instead of our standard net-30."'
      },
      {
        id: 8, section: 'Listening Part 3', type: 'conversation',
        passage: null,
        question: 'What will the man do after the meeting?',
        options: [
          'A. Call the Harmon account directly',
          'B. Sign the contract immediately',
          'C. Contact the finance team',
          'D. Revise the payment terms himself'
        ],
        correct_answer: 2,
        explanation: 'The man says "I\'ll contact them [the finance team] right after this meeting."'
      },
      {
        id: 9, section: 'Listening Part 4', type: 'short-talk',
        passage: `Attention all Westbridge staff: The main building car park will be closed for resurfacing from Monday through Wednesday next week. All staff are asked to use the overflow car park on Chandler Street, approximately a five-minute walk from the main entrance. A free shuttle will run between the overflow car park and the main entrance every twenty minutes, from seven to nine AM and from five to seven PM. Employees who regularly use public transport are unaffected — the number 14 bus continues to stop directly outside our main entrance. We apologise for any inconvenience. Thank you for your patience.`,
        question: 'Why is the main car park closing next week?',
        options: [
          'A. For a security upgrade',
          'B. To install electric vehicle charging stations',
          'C. For resurfacing works',
          'D. Due to a private corporate event'
        ],
        correct_answer: 2,
        explanation: 'The announcement states the car park "will be closed for resurfacing."'
      },
      {
        id: 10, section: 'Listening Part 4', type: 'short-talk',
        passage: null,
        question: 'How often does the shuttle service run?',
        options: ['A. Every 10 minutes', 'B. Every 15 minutes', 'C. Every 20 minutes', 'D. Every 30 minutes'],
        correct_answer: 2,
        explanation: 'The announcement says the shuttle runs "every twenty minutes."'
      },
      {
        id: 11, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: 'The annual report _____ to all shareholders before the end of the fiscal year.',
        options: ['A. distribute', 'B. distributes', 'C. will be distributed', 'D. distributing'],
        correct_answer: 2,
        explanation: '"Will be distributed" — passive voice future tense is required because the report receives the action.'
      },
      {
        id: 12, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: 'Ms. Park is responsible _____ managing all external vendor relationships.',
        options: ['A. to', 'B. of', 'C. for', 'D. in'],
        correct_answer: 2,
        explanation: '"Responsible for" is a fixed prepositional phrase.'
      },
      {
        id: 13, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: 'Despite _____ three rounds of interviews, the position remains unfilled.',
        options: ['A. conduct', 'B. conducted', 'C. to conduct', 'D. conducting'],
        correct_answer: 3,
        explanation: '"Despite" is a preposition followed by a noun or gerund (verb + -ing).'
      },
      {
        id: 14, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: 'The board approved _____ expansion into three new markets by next year.',
        options: ['A. a', 'B. an', 'C. the', 'D. some'],
        correct_answer: 1,
        explanation: '"Expansion" begins with a vowel sound, so the indefinite article "an" is required.'
      },
      {
        id: 15, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: 'The conference was _____ postponed because of the severe weather conditions.',
        options: ['A. consequence', 'B. consequent', 'C. consequently', 'D. consequential'],
        correct_answer: 2,
        explanation: '"Consequently" is an adverb modifying the past participle "postponed."'
      },
      {
        id: 16, section: 'Reading Part 6', type: 'text-completion',
        passage: `SUBJECT: Q3 Performance Review — Important Notice\n\nDear Team,\n\nThis message is to [BLANK_1] you that the Q3 performance review cycle begins on 1 September. All line managers are [BLANK_2] to schedule one-on-one meetings with their direct reports no later than 15 September. Review forms are available on the HR portal and must be submitted [BLANK_3] completing each meeting. If you have any questions regarding the process, please do not hesitate to contact the HR department directly.\n\nRegards,\nHuman Resources`,
        question: 'Choose the best word for [BLANK_1].',
        options: ['A. warn', 'B. remind', 'C. inform', 'D. instruct'],
        correct_answer: 2,
        explanation: '"Inform" is the standard professional phrase for providing official notification.'
      },
      {
        id: 17, section: 'Reading Part 6', type: 'text-completion',
        passage: null,
        question: 'Choose the best word for [BLANK_2].',
        options: ['A. encouraged', 'B. prohibited', 'C. required', 'D. permitted'],
        correct_answer: 2,
        explanation: '"Required" conveys obligation — appropriate for an official process.'
      },
      {
        id: 18, section: 'Reading Part 6', type: 'text-completion',
        passage: null,
        question: 'Choose the best word for [BLANK_3].',
        options: ['A. despite', 'B. until', 'C. although', 'D. following'],
        correct_answer: 3,
        explanation: '"Following" means "after" and correctly links "submitted" with "completing each meeting" as a sequence.'
      },
      {
        id: 19, section: 'Reading Part 7', type: 'main-idea',
        passage: `Remote and hybrid work models have fundamentally reshaped corporate culture since 2020. A survey by Global Workforce Analytics found that 74% of companies plan to make some remote work arrangements permanent. Advocates argue these models increase productivity by eliminating commute time and reducing overhead costs. Critics, however, point to weakened team cohesion, challenges in onboarding, and the risk of professional isolation. The hybrid approach — combining scheduled office days with remote work — has emerged as the most popular compromise. HR experts emphasise that success depends on clear communication norms, results-based performance evaluation, and regular team-building activities. Notably, companies such as Microsoft and Salesforce report that hybrid employees score higher on job satisfaction surveys than fully in-office counterparts.`,
        question: 'What is the main purpose of this article?',
        options: [
          'A. To argue that all employees should work from home permanently',
          'B. To present an overview of remote and hybrid work trends and their effects',
          'C. To explain why traditional office work is superior to remote work',
          'D. To describe the challenges of managing fully remote international teams'
        ],
        correct_answer: 1,
        explanation: 'The article presents both advantages and challenges of remote/hybrid work — an overview, not an argument for one side.'
      },
      {
        id: 20, section: 'Reading Part 7', type: 'specific-detail',
        passage: null,
        question: 'According to the article, what percentage of companies plan to make some remote arrangements permanent?',
        options: ['A. 54%', 'B. 68%', 'C. 74%', 'D. 81%'],
        correct_answer: 2,
        explanation: 'The article states "74% of companies plan to make some remote work arrangements permanent."'
      },
    ];
  }

  // ─── TOEIC Fallback Set 1: Job Interview · Hotel · Office Maintenance ─────────
  // ─── IELTS Fallback Set 2: Flight Booking · University Open Day · Smart Cities ─
  private ieltsFallback2(): ExamQuestion[] {
    return [
      {
        id: 1, section: 'Listening Part 1', type: 'note-completion',
        passage: `Agent: Good afternoon, Sunvista Travel. How can I help?\nCustomer: Hi, I'd like to book return flights to Madrid for two adults.\nAgent: When are you travelling?\nCustomer: Departing 18th June, returning 25th June.\nAgent: I have direct Iberia flights — outbound at 07:40, return at 14:50. Total for two adults is three hundred and ninety-six pounds.\nCustomer: Perfect. My name is Caroline Webb.\nAgent: Contact number?\nCustomer: 07621 447 890.\nAgent: I'll need a deposit of eighty pounds per person today. Your booking reference is MAD2261. E-tickets arrive within three hours.`,
        question: 'Complete the note. The total price for two adults is _____.',
        options: ['A. £280', 'B. £320', 'C. £396', 'D. £450'],
        correct_answer: 2,
        explanation: 'The agent says "Total for two adults is three hundred and ninety-six pounds" — £396.'
      },
      {
        id: 2, section: 'Listening Part 1', type: 'note-completion',
        passage: null,
        question: 'Complete the note. The deposit required per person is _____.',
        options: ['A. £50', 'B. £70', 'C. £80', 'D. £100'],
        correct_answer: 2,
        explanation: 'The agent states "I\'ll need a deposit of eighty pounds per person today."'
      },
      {
        id: 3, section: 'Listening Part 1', type: 'multiple-choice',
        passage: null,
        question: 'When will the e-tickets be received?',
        options: ['A. Immediately after booking', 'B. Within one hour', 'C. Within three hours', 'D. The following morning'],
        correct_answer: 2,
        explanation: 'The agent says "E-tickets arrive within three hours."'
      },
      {
        id: 4, section: 'Listening Part 1', type: 'true-false-not-given',
        passage: null,
        question: 'The customer is booking for one person only.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 1,
        explanation: 'The customer asks to book for "two adults", so travelling alone is False.'
      },
      {
        id: 5, section: 'Listening Part 2', type: 'multiple-choice',
        passage: `Speaker: Welcome to Kingswood University Open Day. I'm Dr. Patel from Student Admissions. Our campus covers 120 acres and is home to 18,000 students from over 90 countries. Today you can visit facilities, meet students, and attend subject talks. The engineering talk starts at 11 am in the Hamilton Building — that's Building C on your map. Lunch is free in the Students' Union from 12:30. Campus parking is available in Zone B only — Zone A is reserved for deliveries. Audio guides cost two pounds fifty at the main desk. The open day ends at 4 pm.`,
        question: 'Where does the engineering faculty talk take place?',
        options: ['A. The Students\' Union', 'B. The main information desk', 'C. The Hamilton Building', 'D. Zone B car park'],
        correct_answer: 2,
        explanation: 'Dr. Patel says the engineering talk is "in the Hamilton Building — that\'s Building C on your map."'
      },
      {
        id: 6, section: 'Listening Part 2', type: 'multiple-choice',
        passage: null,
        question: 'Which parking zone can visitors use on open day?',
        options: ['A. Zone A only', 'B. Zone B only', 'C. Both zones', 'D. No parking is available'],
        correct_answer: 1,
        explanation: 'The speaker says "parking is available in Zone B only — Zone A is reserved for deliveries."'
      },
      {
        id: 7, section: 'Listening Part 2', type: 'multiple-choice',
        passage: null,
        question: 'How much does an audio guide cost?',
        options: ['A. Free', 'B. £1.00', 'C. £2.50', 'D. £5.00'],
        correct_answer: 2,
        explanation: 'The speaker says audio guides cost "two pounds fifty at the main desk."'
      },
      {
        id: 8, section: 'Reading', type: 'note-completion',
        passage: `The term "smart city" refers to an urban area that uses digital technology and data analytics to enhance city services and residents' quality of life. Smart cities integrate sensor networks, connected transport, and cloud platforms to manage resources efficiently. The concept gained momentum in the early 2000s when technology companies began promoting digitally connected urban infrastructure.\n\nSingapore is widely regarded as a global leader in smart city development. The city-state employs a vast sensor network to monitor air quality, traffic congestion, and public cleanliness. Data feeds into the Virtual Singapore project — a three-dimensional model that planners use to simulate urban development.\n\nCritics raise serious concerns about privacy and data security. Extensive surveillance means citizens face continuous monitoring. Data collected for traffic management has been repurposed for law enforcement without residents' knowledge or consent. These concerns contributed to the cancellation of Alphabet's Sidewalk Labs project in Toronto in 2020, following significant public opposition.\n\nDespite these challenges, progress continues. Barcelona's smart street lighting adjusts to pedestrian activity, reducing electricity use by 30 percent. Amsterdam uses bin sensors to optimise collection routes, cutting vehicle journeys by 20 percent. Proponents argue that the environmental and economic benefits outweigh privacy costs as data governance frameworks improve.`,
        question: 'Complete the note. Singapore monitors its city through an extensive network of _____.',
        options: ['A. drones', 'B. satellites', 'C. sensors', 'D. cameras'],
        correct_answer: 2,
        explanation: 'The passage states Singapore "employs a vast sensor network to monitor air quality, traffic, and cleanliness."'
      },
      {
        id: 9, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note. The Virtual Singapore project creates a _____ model of the city.',
        options: ['A. two-dimensional', 'B. three-dimensional', 'C. satellite-based', 'D. digital financial'],
        correct_answer: 1,
        explanation: 'The passage describes Virtual Singapore as "a three-dimensional model that planners use to simulate urban development."'
      },
      {
        id: 10, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note. Barcelona\'s smart lighting reduced electricity use by _____ percent.',
        options: ['A. 10', 'B. 20', 'C. 25', 'D. 30'],
        correct_answer: 3,
        explanation: 'The passage states Barcelona\'s lighting cuts "electricity use by 30 percent."'
      },
      {
        id: 11, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note. Amsterdam\'s bin-sensor system reduced vehicle journeys by _____ percent.',
        options: ['A. 10', 'B. 15', 'C. 20', 'D. 35'],
        correct_answer: 2,
        explanation: 'The passage states Amsterdam\'s system cut "vehicle journeys by 20 percent."'
      },
      {
        id: 12, section: 'Reading', type: 'note-completion',
        passage: null,
        question: 'Complete the note. The Sidewalk Labs smart city project was cancelled in the city of _____.',
        options: ['A. Singapore', 'B. Barcelona', 'C. Amsterdam', 'D. Toronto'],
        correct_answer: 3,
        explanation: 'The passage states the Sidewalk Labs project was cancelled "in Toronto in 2020."'
      },
      {
        id: 13, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'The smart city concept began gaining widespread interest in the late 1990s.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 1,
        explanation: 'The passage says the concept "gained momentum in the early 2000s" — not the late 1990s. This is False.'
      },
      {
        id: 14, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'The Virtual Singapore project is used by planners to simulate urban development.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 0,
        explanation: 'The passage explicitly states the model is used "to simulate urban development."'
      },
      {
        id: 15, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'Traffic data in some smart cities has been shared with law enforcement without residents\' consent.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 0,
        explanation: 'The passage states data "has been repurposed for law enforcement without residents\' knowledge or consent."'
      },
      {
        id: 16, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'The Sidewalk Labs project was cancelled mainly because of rising construction costs.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 1,
        explanation: 'The passage says cancellation followed "significant public opposition" — not construction costs. This is False.'
      },
      {
        id: 17, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'Singapore has implemented smart city technology on a larger scale than any other city in the world.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 2,
        explanation: 'The passage calls Singapore a "global leader" but does not compare scale numerically. Not Given.'
      },
      {
        id: 18, section: 'Reading', type: 'true-false-not-given',
        passage: null,
        question: 'Amsterdam uses sensors inside rubbish bins to plan collection routes.',
        options: ['A. True', 'B. False', 'C. Not Given'],
        correct_answer: 0,
        explanation: 'The passage states Amsterdam "uses bin sensors to optimise collection routes."'
      },
      {
        id: 19, section: 'Writing', type: 'writing-task1',
        passage: '{"type":"bar-grouped","title":"Daily Internet Usage by Age Group and Country (2023)","yLabel":"% of Population","yMax":100,"note":"Source: International Telecommunication Union, 2023","categories":["UK","USA","Japan","Brazil"],"series":[{"name":"18–30","color":"#6366f1","values":[96,97,93,82]},{"name":"31–50","color":"#8b5cf6","values":[88,89,81,65]},{"name":"51+","color":"#c4b5fd","values":[62,68,55,35]}]}',
        question: 'Writing Task 1 — minimum 150 words: Summarise the information shown in the bar chart. Select and report the main features, and make comparisons where relevant.',
        options: [], correct_answer: -1, explanation: ''
      },
      {
        id: 20, section: 'Writing', type: 'writing-task2',
        passage: null,
        question: 'Writing Task 2 — minimum 250 words: Some people believe that cities should invest more in public transport rather than building new roads. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
        options: [], correct_answer: -1, explanation: ''
      },
    ];
  }

  // ─── TOEIC Fallback Set 2: Airport · HR Performance · Finance Report ──────────
  private toeicFallback2(): ExamQuestion[] {
    return [
      {
        id: 1, section: 'Listening Part 1', type: 'photograph',
        passage: 'Two workers in high-visibility vests and hard hats are standing beside a construction scaffold on the exterior of an office building. One worker is reviewing a document on a clipboard while the other examines the scaffolding joints.',
        question: 'What are the workers doing?',
        options: [
          'A. They are painting the walls of a building.',
          'B. They are reviewing work and inspecting the scaffolding.',
          'C. They are assembling furniture inside an office.',
          'D. They are loading equipment onto a delivery truck.'
        ],
        correct_answer: 1,
        explanation: 'One worker reviews a clipboard document while the other inspects scaffolding — they are reviewing work and checking the structure.'
      },
      {
        id: 2, section: 'Listening Part 1', type: 'photograph',
        passage: 'A woman is seated at a reception desk in a modern hotel lobby. She is smiling and handing a key card to a guest who is standing across the counter with a suitcase beside him.',
        question: 'What is happening at the reception desk?',
        options: [
          'A. The receptionist is checking out a departing guest.',
          'B. The receptionist is handing a room key to a guest.',
          'C. The receptionist is signing a delivery package.',
          'D. The receptionist is taking a telephone reservation.'
        ],
        correct_answer: 1,
        explanation: 'The receptionist is smiling and handing a key card to a guest — a check-in interaction.'
      },
      {
        id: 3, section: 'Listening Part 2', type: 'question-response',
        passage: 'Could you send me the updated project timeline before Thursday?',
        question: 'Which response is most appropriate?',
        options: [
          'A. "Yes, I\'ll email it to you by Wednesday afternoon."',
          'B. "The meeting room is booked for Thursday."',
          'C. "I prefer the second proposal."'
        ],
        correct_answer: 0,
        explanation: 'Option A directly answers the request by confirming when the document will be sent.'
      },
      {
        id: 4, section: 'Listening Part 2', type: 'question-response',
        passage: "Has the new employee handbook been distributed to all staff yet?",
        question: 'Which response is most appropriate?',
        options: [
          'A. "The HR department hired three people last month."',
          'B. "Not yet — we\'re waiting for the printed copies to arrive."',
          'C. "The canteen closes at 2 pm on Fridays."'
        ],
        correct_answer: 1,
        explanation: 'Option B directly addresses the question about whether the handbook has been distributed.'
      },
      {
        id: 5, section: 'Listening Part 2', type: 'question-response',
        passage: "Who is responsible for approving the quarterly expense reports?",
        question: 'Which response is most appropriate?',
        options: [
          'A. "The reports are due at the end of March."',
          'B. "I\'ll check with the finance team about the deadline."',
          'C. "That would be the Chief Financial Officer."'
        ],
        correct_answer: 2,
        explanation: 'Option C answers the question "who is responsible" by naming the relevant officer.'
      },
      {
        id: 6, section: 'Listening Part 3', type: 'conversation',
        passage: `Manager: Sarah, I've reviewed your performance for this quarter. Your client satisfaction scores have been excellent — 94 percent. However, I noticed a few missed internal deadlines.\nSarah: You're right. I was managing two large accounts simultaneously and struggled with time management.\nManager: I'd like you to attend our project management workshop next month. It's a two-day session on prioritisation techniques.\nSarah: I think that would really help. Is it held on-site?\nManager: Yes — in Conference Room D. I'll send you the registration details.`,
        question: 'Why does the manager want Sarah to attend the workshop?',
        options: [
          'A. Her client satisfaction scores are too low.',
          'B. She needs to improve her project management and time management.',
          'C. She missed a client presentation.',
          'D. She has not completed mandatory training.'
        ],
        correct_answer: 1,
        explanation: 'The manager mentions missed deadlines and poor time management, then recommends a project management workshop specifically for "prioritisation techniques."'
      },
      {
        id: 7, section: 'Listening Part 3', type: 'conversation',
        passage: null,
        question: 'Where will the workshop be held?',
        options: [
          'A. At an off-site training centre',
          'B. Online via video conferencing',
          'C. In Conference Room D',
          'D. The location has not yet been confirmed'
        ],
        correct_answer: 2,
        explanation: 'The manager says "Yes — in Conference Room D."'
      },
      {
        id: 8, section: 'Listening Part 3', type: 'conversation',
        passage: null,
        question: "What was Sarah's client satisfaction score this quarter?",
        options: ['A. 84 percent', 'B. 89 percent', 'C. 94 percent', 'D. 97 percent'],
        correct_answer: 2,
        explanation: 'The manager says "Your client satisfaction scores have been excellent — 94 percent."'
      },
      {
        id: 9, section: 'Listening Part 4', type: 'short-talk',
        passage: `Attention all passengers on Flight IB3347 to Madrid. We regret to announce a delay of approximately forty-five minutes due to late arrival of the incoming aircraft. The new boarding time is 09:15, and the gate remains Gate 12B. We apologise for the inconvenience. Passengers requiring special assistance should approach the gate desk immediately. Refreshment vouchers worth five pounds are available at the information counter in the departures hall. Thank you for your patience.`,
        question: 'Why is the flight delayed?',
        options: [
          'A. Bad weather at the destination',
          'B. A technical fault with the aircraft',
          'C. Late arrival of the incoming plane',
          'D. Air traffic control restrictions'
        ],
        correct_answer: 2,
        explanation: 'The announcement states the delay is "due to late arrival of the incoming aircraft."'
      },
      {
        id: 10, section: 'Listening Part 4', type: 'short-talk',
        passage: null,
        question: 'What is offered to affected passengers?',
        options: [
          'A. A seat upgrade',
          'B. A hotel voucher',
          'C. A five-pound refreshment voucher',
          'D. A full refund of the ticket price'
        ],
        correct_answer: 2,
        explanation: 'The announcement says "Refreshment vouchers worth five pounds are available at the information counter."'
      },
      {
        id: 11, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: 'All employees are _____ to submit their timesheets by 5 pm every Friday.',
        options: ['A. required', 'B. requires', 'C. requiring', 'D. requirement'],
        correct_answer: 0,
        explanation: '"Required" is the correct adjective form in "are required to" — a standard passive obligation structure.'
      },
      {
        id: 12, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: 'The quarterly sales figures _____ a significant improvement over the previous year.',
        options: ['A. indicate', 'B. indication', 'C. indicated', 'D. indicating'],
        correct_answer: 2,
        explanation: 'The subject "figures" is plural and the sentence is in past context, so "indicated" is correct.'
      },
      {
        id: 13, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: 'Please contact the IT helpdesk _____ you experience any login issues with the new system.',
        options: ['A. despite', 'B. although', 'C. if', 'D. unless'],
        correct_answer: 2,
        explanation: '"If" introduces a conditional clause — the correct conjunction for this conditional instruction.'
      },
      {
        id: 14, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: 'The marketing team _____ the campaign proposal to senior management next week.',
        options: ['A. present', 'B. will present', 'C. presented', 'D. has presented'],
        correct_answer: 1,
        explanation: '"Next week" indicates future tense — "will present" is correct.'
      },
      {
        id: 15, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: 'The conference room on the third floor has a _____ for up to thirty participants.',
        options: ['A. capacity', 'B. capable', 'C. capably', 'D. capable of'],
        correct_answer: 0,
        explanation: '"Capacity" is the correct noun form — "has a capacity for" is the standard expression.'
      },
      {
        id: 16, section: 'Reading Part 6', type: 'text-completion',
        passage: `To: All Staff\nFrom: HR Department\nSubject: Updated Remote Work Policy\n\nDear Team,\n\nWe are pleased to announce _____ our remote work policy has been updated effective 1st July. Employees may now work from home up to three days per week, provided that core hours of 10 am to 3 pm are observed. All remote working arrangements must be approved by your line manager _____ advance. Requests should be submitted at least five working days before the intended remote working period. For further questions, please contact the HR team at hr@company.com.`,
        question: 'Which word best fills the first blank?',
        options: ['A. what', 'B. that', 'C. which', 'D. how'],
        correct_answer: 1,
        explanation: '"Announce that" is the standard verb + conjunction structure in formal English — "announce that [clause]."'
      },
      {
        id: 17, section: 'Reading Part 6', type: 'text-completion',
        passage: null,
        question: 'Which word best fills the second blank?',
        options: ['A. in', 'B. on', 'C. at', 'D. by'],
        correct_answer: 0,
        explanation: '"In advance" is the correct fixed phrase meaning beforehand.'
      },
      {
        id: 18, section: 'Reading Part 6', type: 'text-completion',
        passage: null,
        question: 'What is the main purpose of this memo?',
        options: [
          'A. To announce a change in office opening hours',
          'B. To inform staff of changes to the remote work policy',
          'C. To remind employees to submit timesheets',
          'D. To introduce a new HR manager'
        ],
        correct_answer: 1,
        explanation: 'The subject line reads "Updated Remote Work Policy" and the memo outlines new work-from-home rules.'
      },
      {
        id: 19, section: 'Reading Part 7', type: 'main-idea',
        passage: `FINANCE QUARTERLY REPORT — Q2 Summary\n\nRevenue for the second quarter reached $4.7 million, representing a 12 percent increase compared to Q2 of the previous year. This growth was driven primarily by the expansion of our enterprise software division, which contributed $2.1 million — a 22 percent year-on-year increase.\n\nOperating expenses remained broadly stable at $3.2 million, resulting in an operating profit of $1.5 million. The company maintained a healthy cash reserve of $6.3 million at quarter end.\n\nLooking ahead, the Board anticipates continued growth in Q3, supported by three new client contracts signed in June totalling $800,000 in projected annual revenue. Investment in product development will increase by 15 percent in the second half of the year to support the scheduled launch of our next-generation analytics platform in October.`,
        question: 'What is the main topic of this report?',
        options: [
          'A. The company\'s hiring plans for Q3',
          'B. The company\'s financial performance in Q2',
          'C. The launch of a new software product',
          'D. A merger with another technology company'
        ],
        correct_answer: 1,
        explanation: 'The report is titled "Q2 Summary" and covers revenue, expenses, profit, and cash — all financial performance data.'
      },
      {
        id: 20, section: 'Reading Part 7', type: 'specific-detail',
        passage: null,
        question: 'By how much will product development investment increase in the second half of the year?',
        options: ['A. 10 percent', 'B. 12 percent', 'C. 15 percent', 'D. 22 percent'],
        correct_answer: 2,
        explanation: 'The report states "Investment in product development will increase by 15 percent in the second half of the year."'
      },
    ];
  }

  private toeicFallback1(): ExamQuestion[] {
    return [
      {
        id: 1, section: 'Listening Part 1', type: 'photograph',
        passage: "A man in a white chef's uniform is standing behind a kitchen counter, carefully arranging plates of food on a large serving tray. Stainless steel appliances are visible in the background and the kitchen is brightly lit.",
        question: 'What is the man doing?',
        options: [
          'A. He is washing dishes at a sink.',
          'B. He is arranging food on a serving tray.',
          'C. He is loading items onto a storage shelf.',
          'D. He is carrying boxes to a back room.'
        ],
        correct_answer: 1,
        explanation: "The scene shows a man in chef's uniform arranging plates on a tray — preparing food for service."
      },
      {
        id: 2, section: 'Listening Part 1', type: 'photograph',
        passage: 'A woman wearing a headset is seated at a desk with two computer monitors in front of her. She is looking at one screen and writing notes on a notepad. A telephone and a coffee mug are on the desk beside her.',
        question: 'What is the woman most likely doing?',
        options: [
          'A. She is repairing a computer monitor.',
          'B. She is attending an online training course.',
          'C. She is working at a customer service station.',
          'D. She is watching a company presentation.'
        ],
        correct_answer: 2,
        explanation: 'The headset, two monitors, and notepad are consistent with customer service or call centre work.'
      },
      {
        id: 3, section: 'Listening Part 2', type: 'question-response',
        passage: 'How many people are expected to attend the product launch event?',
        question: 'Which response is most appropriate?',
        options: [
          'A. Around 150 guests have confirmed.',
          'B. The launch will be held in the main hall.',
          'C. It was scheduled for last Thursday.'
        ],
        correct_answer: 0,
        explanation: 'Option A directly answers "how many" with a specific number.'
      },
      {
        id: 4, section: 'Listening Part 2', type: 'question-response',
        passage: 'Who approved the updated marketing budget?',
        question: 'Which response is most appropriate?',
        options: [
          'A. The budget covers advertising and events.',
          'B. The CFO signed off on it this morning.',
          'C. Marketing submitted their proposal yesterday.'
        ],
        correct_answer: 1,
        explanation: 'Option B directly answers "who" with a specific person.'
      },
      {
        id: 5, section: 'Listening Part 2', type: 'question-response',
        passage: "Could you send me the updated project timeline?",
        question: 'Which response is most appropriate?',
        options: [
          'A. The project has three team members.',
          'B. It started at the beginning of last month.',
          "C. Of course — I'll email it right after this call."
        ],
        correct_answer: 2,
        explanation: 'Option C directly accepts the request and provides a timeframe.'
      },
      {
        id: 6, section: 'Listening Part 3', type: 'conversation',
        passage: `Woman: Hi, Robert. I just heard from the Hartfield Hotel. They say the banquet hall we booked for the annual sales conference is being renovated.\nMan: That's the week after next. Did they offer an alternative?\nWoman: Yes, they're offering us the Garden Suite at the same price. It holds up to 90 guests.\nMan: We're expecting about 80, so the capacity should be fine. What about the audio-visual setup?\nWoman: That's my concern. The original hall had built-in screens and a full sound system. I'm not sure about the Garden Suite.\nMan: We need to confirm that before we agree. Could you follow up with them today?\nWoman: Sure. I'll also get written confirmation of the price.`,
        question: 'What is the main problem the speakers are discussing?',
        options: [
          'A. The conference date has been changed.',
          'B. The original venue is no longer available.',
          'C. The hotel has increased its prices.',
          'D. The number of guests exceeds the room capacity.'
        ],
        correct_answer: 1,
        explanation: 'The banquet hall booked for the conference is being renovated and therefore unavailable.'
      },
      {
        id: 7, section: 'Listening Part 3', type: 'conversation',
        passage: null,
        question: 'How many guests are expected at the conference?',
        options: ['A. 70', 'B. 80', 'C. 90', 'D. 100'],
        correct_answer: 1,
        explanation: "The man says \"We're expecting about 80.\""
      },
      {
        id: 8, section: 'Listening Part 3', type: 'conversation',
        passage: null,
        question: 'What will the woman do after the conversation?',
        options: [
          'A. Cancel the hotel reservation',
          'B. Contact the hotel about the audio-visual equipment and confirm the price',
          'C. Book a different venue',
          'D. Reduce the number of conference attendees'
        ],
        correct_answer: 1,
        explanation: 'The man asks her to confirm the AV setup and she also commits to getting written price confirmation.'
      },
      {
        id: 9, section: 'Listening Part 4', type: 'short-talk',
        passage: `Hello, this is a message for Mr. David Chen from Pinnacle Software Solutions. My name is Sandra Morris calling from HR at Helix Industries. We reviewed your application for the Senior Systems Analyst position and were impressed with your experience in cloud architecture. We'd like to invite you for a second interview at our headquarters in downtown Chicago next Wednesday at ten AM. Please bring two copies of your updated resume and any relevant certifications. If that time doesn't work, please call me back at 312-555-0197. We look forward to speaking with you. Have a great day.`,
        question: 'What is the main purpose of this voicemail?',
        options: [
          'A. To offer Mr. Chen a job immediately',
          'B. To invite Mr. Chen for a second interview',
          'C. To request additional documents from Mr. Chen',
          'D. To inform Mr. Chen that he was not selected'
        ],
        correct_answer: 1,
        explanation: 'The caller invites Mr. Chen to "a second interview at our headquarters."'
      },
      {
        id: 10, section: 'Listening Part 4', type: 'short-talk',
        passage: null,
        question: 'What should Mr. Chen bring to the interview?',
        options: [
          'A. A list of professional references',
          'B. A copy of his business portfolio',
          'C. Two copies of his updated resume and relevant certifications',
          'D. His identification documents only'
        ],
        correct_answer: 2,
        explanation: 'The message says "Please bring two copies of your updated resume and any relevant certifications."'
      },
      {
        id: 11, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: "The merger agreement _____ by the board of directors at last night's emergency meeting.",
        options: ['A. approve', 'B. approves', 'C. was approved', 'D. approving'],
        correct_answer: 2,
        explanation: '"Was approved" — passive voice past tense is required.'
      },
      {
        id: 12, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: 'All staff must submit leave requests _____ least two weeks before the intended date.',
        options: ['A. at', 'B. by', 'C. in', 'D. on'],
        correct_answer: 0,
        explanation: '"At least" is a fixed expression meaning "no fewer than."'
      },
      {
        id: 13, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: "The company's profits have _____ significantly since the new CEO took office six months ago.",
        options: ['A. improve', 'B. improving', 'C. improved', 'D. improvement'],
        correct_answer: 2,
        explanation: '"Have improved" — present perfect tense describes change that began in the past and continues to the present.'
      },
      {
        id: 14, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: '_____ the high production costs, the company decided to outsource its manufacturing operations.',
        options: ['A. Despite', 'B. Although', 'C. Because of', 'D. Unless'],
        correct_answer: 2,
        explanation: '"Because of" is a causal preposition followed by a noun phrase — appropriate as costs are the reason for the decision.'
      },
      {
        id: 15, section: 'Reading Part 5', type: 'incomplete-sentence',
        passage: null,
        question: "The marketing director requested a _____ review of the campaign's performance over the past six months.",
        options: ['A. comprehend', 'B. comprehension', 'C. comprehensively', 'D. comprehensive'],
        correct_answer: 3,
        explanation: '"Comprehensive" is an adjective that correctly modifies the noun "review."'
      },
      {
        id: 16, section: 'Reading Part 6', type: 'text-completion',
        passage: `SUBJECT: Annual Office Maintenance — Important Notice\n\nDear All Westgate Staff,\n\nPlease be [BLANK_1] that scheduled maintenance of the building's electrical systems, HVAC units, and fire safety equipment will take place from Monday 14 to Friday 18 July. The building management team will be [BLANK_2] out essential repairs and upgrades during this period.\n\nAll employees are asked to clear personal items from their desks before leaving on Friday 11 July. Sensitive documents should be stored in the locked cabinets provided. The IT department will ensure that all servers are [BLANK_3] backed up before work commences. For queries, please contact Facilities Management at extension 4420.\n\nThank you for your cooperation.\nWestgate Facilities Team`,
        question: 'Choose the best word for [BLANK_1].',
        options: ['A. warned', 'B. reminded', 'C. advised', 'D. requested'],
        correct_answer: 2,
        explanation: '"Please be advised" is standard formal corporate language for providing official notice.'
      },
      {
        id: 17, section: 'Reading Part 6', type: 'text-completion',
        passage: null,
        question: 'Choose the best word for [BLANK_2].',
        options: ['A. taking', 'B. putting', 'C. carrying', 'D. bringing'],
        correct_answer: 2,
        explanation: '"Carrying out" is a fixed phrase meaning "performing" a task.'
      },
      {
        id: 18, section: 'Reading Part 6', type: 'text-completion',
        passage: null,
        question: 'Choose the best word for [BLANK_3].',
        options: ['A. quickly', 'B. recently', 'C. thoroughly', 'D. hardly'],
        correct_answer: 2,
        explanation: '"Thoroughly backed up" means completely and fully backed up — appropriate for important server data.'
      },
      {
        id: 19, section: 'Reading Part 7', type: 'main-idea',
        passage: `HELIX INDUSTRIES LAUNCHES EMPLOYEE WELLNESS INITIATIVE\n\nHelix Industries has announced the launch of a comprehensive Employee Wellness Programme (EWP), effective from the first of next month. The initiative follows an internal survey in which 82% of employees reported experiencing work-related stress at least once per week.\n\nThe programme includes four main components: a subsidised on-site gym membership, access to confidential counselling services through a third-party provider, monthly wellness workshops covering topics such as mindfulness and nutrition, and flexible working options for eligible roles.\n\nChief Human Resources Officer Elena Vasquez stated: "Our people are our greatest asset. This programme reflects our commitment to building a healthier, more productive workplace." She added that the company will evaluate effectiveness through an annual employee satisfaction survey.\n\nEmployees wishing to enrol in the counselling service should contact HR directly. Gym access will be automatically available to all full-time staff from the launch date. Part-time employees may apply for subsidised gym membership through their line managers.`,
        question: 'What is the main purpose of this article?',
        options: [
          'A. To advertise a gym membership service to the public',
          'B. To announce a new employee wellness programme',
          'C. To report the findings of an employee stress survey',
          'D. To explain new flexible working policies'
        ],
        correct_answer: 1,
        explanation: "The article announces the launch of Helix Industries' Employee Wellness Programme."
      },
      {
        id: 20, section: 'Reading Part 7', type: 'specific-detail',
        passage: null,
        question: 'According to the article, which employees must apply for gym access through their line managers?',
        options: [
          'A. All Helix Industries employees',
          'B. Full-time employees hired after the launch date',
          'C. Employees in the HR department',
          'D. Part-time employees'
        ],
        correct_answer: 3,
        explanation: 'The article states "Part-time employees may apply for subsidised gym membership through their line managers."'
      },
    ];
  }

  // ─── TOEFL Fallback Set 2: Memory · Writing Systems · Behavioral Econ · AI ────
  private toeflFallback2(): ExamQuestion[] {
    return [
      {
        id: 1, section: 'Reading Passage 1', type: 'main-idea',
        passage: `Human memory is not a single, unified system but rather a collection of distinct processes that encode, store, and retrieve information in different ways. Psychologists generally distinguish between two broad categories: explicit memory, which involves the conscious recall of facts and events, and implicit memory, which operates below the level of awareness and influences behaviour without deliberate recollection.\n\nExplicit memory is further divided into episodic memory — the recollection of personal experiences situated in time and place, such as remembering one's graduation day — and semantic memory, which stores general knowledge about the world, such as the capital cities of countries or the rules of grammar. These two forms of explicit memory rely on overlapping but distinct brain regions, with the hippocampus playing a particularly critical role in the formation of new episodic memories.\n\nImplicit memory encompasses procedural memory — the know-how that underlies skills such as riding a bicycle or typing — as well as priming, a phenomenon in which prior exposure to a stimulus influences the response to a later, related stimulus without conscious awareness. Procedural memories, once acquired through practice, are highly resistant to forgetting and are stored primarily in the cerebellum and basal ganglia rather than the hippocampus.\n\nResearch on memory has important practical applications. Understanding how memories are formed and consolidated during sleep has led to recommendations that students review material before sleeping rather than "cramming" the morning of an exam. Studies of individuals with amnesia — particularly the famous patient H.M., who had his hippocampus surgically removed — have been instrumental in mapping the neural architecture of memory and demonstrating that different memory systems can be selectively impaired.`,
        question: 'What is the main purpose of this passage?',
        options: [
          'A. To argue that sleep is the most important factor in memory formation',
          'B. To describe the different types of human memory and their brain bases',
          'C. To explain why patients with amnesia cannot learn new skills',
          'D. To compare the memory capacities of humans and other animals'
        ],
        correct_answer: 1,
        explanation: 'The passage introduces and explains explicit vs implicit memory, episodic vs semantic memory, procedural memory and priming, all within a framework of how memory works in the brain.'
      },
      {
        id: 2, section: 'Reading Passage 1', type: 'vocabulary',
        passage: null,
        question: 'The word "consolidate" as used in the context of memory research is closest in meaning to:',
        options: ['A. erase', 'B. strengthen and stabilise', 'C. retrieve consciously', 'D. divide into categories'],
        correct_answer: 1,
        explanation: 'Memory consolidation refers to the process by which newly formed memories are stabilised and strengthened, particularly during sleep.'
      },
      {
        id: 3, section: 'Reading Passage 1', type: 'factual-detail',
        passage: null,
        question: 'According to the passage, which brain region is especially critical for forming new episodic memories?',
        options: ['A. The cerebellum', 'B. The basal ganglia', 'C. The hippocampus', 'D. The prefrontal cortex'],
        correct_answer: 2,
        explanation: 'The passage states "the hippocampus playing a particularly critical role in the formation of new episodic memories."'
      },
      {
        id: 4, section: 'Reading Passage 1', type: 'inference',
        passage: null,
        question: 'What can be inferred from the description of patient H.M.?',
        options: [
          'A. Removing the hippocampus eliminates all forms of memory',
          'B. Different memory systems can be damaged independently of one another',
          'C. Amnesia always results from surgical procedures',
          'D. Semantic memory is more vulnerable than procedural memory'
        ],
        correct_answer: 1,
        explanation: 'H.M.\'s case showed that hippocampal removal impaired certain memories while leaving others intact — demonstrating selective impairment of distinct memory systems.'
      },
      {
        id: 5, section: 'Reading Passage 1', type: 'purpose',
        passage: null,
        question: 'Why does the author mention riding a bicycle in paragraph 3?',
        options: [
          'A. To illustrate how children learn physical skills more easily than adults',
          'B. To provide an example of episodic memory',
          'C. To give a concrete example of procedural (implicit) memory',
          'D. To show that the hippocampus controls all physical coordination'
        ],
        correct_answer: 2,
        explanation: 'Riding a bicycle is used as a familiar example of procedural memory — a skill-based implicit memory that does not require conscious recall.'
      },
      {
        id: 6, section: 'Reading Passage 2', type: 'main-idea',
        passage: `Writing systems are among the most significant technological achievements in human history. They allow knowledge, laws, and stories to be recorded, transmitted across time and distance, and accumulated across generations. The earliest known writing systems emerged independently in several regions of the world: Mesopotamia (modern-day Iraq), ancient Egypt, the Indus Valley, and Mesoamerica.\n\nThe Sumerian cuneiform script, developed in Mesopotamia around 3200 BCE, is generally considered the oldest known writing system. It began as a series of pictographic symbols used for administrative record-keeping — primarily to track grain, livestock, and labour. Over centuries, the pictographs were simplified into abstract wedge-shaped marks pressed into clay tablets with a reed stylus. The system eventually evolved to represent not just objects but syllables and grammatical elements, enabling the recording of literature and law, including the famous Code of Hammurabi.\n\nEgyptian hieroglyphics, developed around the same period, followed a different trajectory. Unlike cuneiform, which became increasingly abstract, hieroglyphics retained a pictorial character throughout their use. They employed a sophisticated combination of logograms (symbols representing whole words), phonograms (symbols representing sounds), and determinatives (symbols indicating category without being pronounced). Hieroglyphics were used for monumental inscriptions, while a faster cursive script called demotic was used for administrative purposes.\n\nThe development of alphabetic writing — in which symbols represent individual consonant or vowel sounds rather than syllables or whole words — represented a major simplification. The first true alphabet is generally attributed to the Phoenicians around 1050 BCE. Their system, with 22 consonant letters and no vowels, was adapted by the Greeks, who added vowel symbols, creating the ancestor of most modern European scripts, including the Latin alphabet used to write English.`,
        question: 'What is the primary focus of this passage?',
        options: [
          'A. A comparison of the artistic quality of early writing systems',
          'B. The origin and development of human writing systems',
          'C. The administrative uses of writing in ancient Mesopotamia',
          'D. Why alphabetic writing replaced all earlier writing systems'
        ],
        correct_answer: 1,
        explanation: 'The passage traces the origin and evolution of writing from cuneiform through hieroglyphics to the alphabet, covering multiple writing systems and their development.'
      },
      {
        id: 7, section: 'Reading Passage 2', type: 'factual-detail',
        passage: null,
        question: 'According to the passage, what were Sumerian cuneiform symbols originally used for?',
        options: [
          'A. Recording religious ceremonies and prayers',
          'B. Tracking grain, livestock, and labour for administration',
          'C. Communicating between different city-states',
          'D. Decorating the walls of public buildings'
        ],
        correct_answer: 1,
        explanation: 'The passage states cuneiform "began as a series of pictographic symbols used for administrative record-keeping — primarily to track grain, livestock, and labour."'
      },
      {
        id: 8, section: 'Reading Passage 2', type: 'vocabulary',
        passage: null,
        question: 'The word "trajectory" in paragraph 3 is closest in meaning to:',
        options: ['A. artistic style', 'B. geographical location', 'C. path of development', 'D. administrative function'],
        correct_answer: 2,
        explanation: '"Trajectory" here refers to the course or direction of development that Egyptian hieroglyphics took over time.'
      },
      {
        id: 9, section: 'Reading Passage 2', type: 'inference',
        passage: null,
        question: 'What can be inferred about the Phoenician alphabet from the passage?',
        options: [
          'A. It was more complex than Sumerian cuneiform',
          'B. It had a direct influence on the writing system used for English',
          'C. It was designed specifically for religious texts',
          'D. The Greeks rejected it as too simple for their language'
        ],
        correct_answer: 1,
        explanation: 'The Phoenician alphabet was adapted by the Greeks, who added vowels, creating "the ancestor of most modern European scripts, including the Latin alphabet used to write English."'
      },
      {
        id: 10, section: 'Reading Passage 2', type: 'factual-detail',
        passage: null,
        question: 'According to the passage, what distinguished Egyptian hieroglyphics from cuneiform in terms of development?',
        options: [
          'A. Hieroglyphics evolved into a fully alphabetic system',
          'B. Hieroglyphics retained a pictorial character while cuneiform became more abstract',
          'C. Cuneiform was used for monuments while hieroglyphics were used for administration',
          'D. Hieroglyphics were simpler and had fewer symbols than cuneiform'
        ],
        correct_answer: 1,
        explanation: 'The passage states "Unlike cuneiform, which became increasingly abstract, hieroglyphics retained a pictorial character throughout their use."'
      },
      {
        id: 11, section: 'Listening — Lecture', type: 'main-idea',
        passage: `Professor: Today I want to talk about behavioral economics — a field that has fundamentally challenged how we understand human decision-making. Classical economics assumes that people are rational agents: they have consistent preferences, they process information accurately, and they make decisions that maximise their own welfare. Behavioral economics, drawing on psychology, shows that real human decision-making is systematically different from this ideal.\n\nOne of the most important concepts is loss aversion. Research by Daniel Kahneman and Amos Tversky showed that people feel losses approximately twice as intensely as equivalent gains. In other words, losing fifty dollars causes about twice as much psychological pain as gaining fifty dollars brings pleasure. This asymmetry has profound implications — it explains why people hold losing investments too long, hoping to recover, rather than cutting their losses.\n\nAnother key concept is the anchoring effect. When people make decisions, they rely heavily on the first piece of information they encounter — the "anchor" — even when it is irrelevant. Experiments show that if you ask people to estimate the population of a city after first spinning a wheel that randomly lands on a high or low number, their estimates are significantly influenced by that random number.\n\nFinally, there's the concept of defaults. People tend to stick with the default option — the option that requires no active choice. Policymakers have used this insight to dramatically increase organ donation rates, pension savings rates, and energy efficiency simply by changing what the default option is, without banning any alternatives. This approach is called "nudging."`,
        question: 'What is the main subject of this lecture?',
        options: [
          'A. Why classical economic models are completely wrong',
          'B. The key concepts and implications of behavioral economics',
          'C. Daniel Kahneman\'s personal career and research methods',
          'D. How loss aversion affects stock market performance only'
        ],
        correct_answer: 1,
        explanation: 'The lecture introduces behavioral economics and explains three key concepts — loss aversion, anchoring, and defaults — and their real-world implications.'
      },
      {
        id: 12, section: 'Listening — Lecture', type: 'factual-detail',
        passage: null,
        question: 'According to the professor, approximately how much more intensely do people feel losses compared to equivalent gains?',
        options: ['A. Equal intensity', 'B. Twice as intensely', 'C. Three times as intensely', 'D. Five times as intensely'],
        correct_answer: 1,
        explanation: 'The professor states "people feel losses approximately twice as intensely as equivalent gains."'
      },
      {
        id: 13, section: 'Listening — Lecture', type: 'inference',
        passage: null,
        question: 'What can be inferred from the professor\'s example of the spinning wheel experiment?',
        options: [
          'A. People can accurately estimate population sizes',
          'B. Random irrelevant information can distort judgments',
          'C. Anchoring only affects decisions about cities',
          'D. People ignore numerical information when making estimates'
        ],
        correct_answer: 1,
        explanation: 'The spinning wheel gives a random irrelevant number, yet it systematically influences estimates — showing that irrelevant anchors distort judgment.'
      },
      {
        id: 14, section: 'Listening — Lecture', type: 'speaker-attitude',
        passage: null,
        question: 'What is the professor\'s attitude toward behavioral economics as a field?',
        options: [
          'A. Skeptical — the field lacks sufficient experimental evidence',
          'B. Neutral — presenting both advantages and serious criticisms equally',
          'C. Positive — highlighting how it has improved understanding and policy',
          'D. Dismissive — suggesting classical economics remains more accurate'
        ],
        correct_answer: 2,
        explanation: 'The professor describes behavioral economics as having "fundamentally challenged" classical economics and highlights practical policy successes (organ donation, pensions) — a clearly positive framing.'
      },
      {
        id: 15, section: 'Listening — Discussion', type: 'main-point',
        passage: `Professor Walsh: Last week we covered automation and its economic effects. Today I want to discuss AI and the future of work more broadly. The question is: is AI fundamentally different from previous waves of automation, or will it follow the same pattern — displacing some jobs while creating new ones? Omar, what do you think?\n\nOmar: I think AI is qualitatively different. Previous automation replaced physical labour — factory workers, typists. But AI can now perform cognitive tasks: writing, analysis, even some medical diagnosis. So it's competing with educated workers, not just manual ones.\n\nProfessor Walsh: That's an important distinction. Priya, do you see it differently?\n\nPriya: I'm more optimistic. History shows that technology creates more jobs than it destroys, over time. The issue is the transition period — and whether we have policies to support workers through it. AI could free humans to focus on more creative, interpersonal work.\n\nProfessor Walsh: So you both agree on the short-term disruption but differ on the long-term outlook. Omar, what policy would you recommend?\n\nOmar: Universal basic income, or at minimum, significant retraining programmes funded by a tax on AI productivity gains.\n\nProfessor Walsh: Good. These are exactly the questions policymakers are grappling with right now.`,
        question: 'What is the main question being discussed in this session?',
        options: [
          'A. Whether AI will be banned by governments',
          'B. How AI compares to previous waves of automation and its effects on work',
          'C. Which specific jobs will disappear within the next five years',
          'D. The technical capabilities of current AI systems'
        ],
        correct_answer: 1,
        explanation: 'Professor Walsh frames the discussion around whether AI is fundamentally different from previous automation and how it will affect the future of work.'
      },
      {
        id: 16, section: 'Listening — Discussion', type: 'student-opinion',
        passage: null,
        question: 'What is Omar\'s main argument about why AI is different from earlier automation?',
        options: [
          'A. AI is cheaper to implement than factory machinery was',
          'B. AI displaces cognitive workers, not just manual labourers',
          'C. AI will create more new jobs than any previous technology',
          'D. AI systems are not yet advanced enough to affect skilled workers'
        ],
        correct_answer: 1,
        explanation: 'Omar argues that earlier automation replaced physical labour, but AI "can now perform cognitive tasks... competing with educated workers, not just manual ones."'
      },
      {
        id: 17, section: 'Listening — Discussion', type: 'implied-meaning',
        passage: null,
        question: "When Professor Walsh says 'you both agree on the short-term disruption but differ on the long-term outlook,' what is he doing?",
        options: [
          'A. Indicating that both students are wrong',
          'B. Summarising where the students agree and disagree to clarify the debate',
          'C. Suggesting the class should end the discussion',
          'D. Revealing his own opinion about AI\'s long-term effects'
        ],
        correct_answer: 1,
        explanation: 'The professor is synthesising both perspectives to help the class see the structure of the debate — a common facilitation technique in academic discussions.'
      },
      {
        id: 18, section: 'Listening — Discussion', type: 'factual-detail',
        passage: null,
        question: "What policy does Omar suggest to support workers displaced by AI?",
        options: [
          'A. Banning certain AI applications in workplaces',
          'B. Universal basic income or retraining funded by an AI productivity tax',
          'C. Requiring companies to hire more human workers alongside AI',
          'D. Reducing the working week to four days'
        ],
        correct_answer: 1,
        explanation: 'Omar recommends "Universal basic income, or at minimum, significant retraining programmes funded by a tax on AI productivity gains."'
      },
      {
        id: 19, section: 'Writing', type: 'integrated-writing',
        passage: 'Behavioral economists argue that "nudging" — designing choice environments to steer people toward better decisions without restricting their options — is a powerful and cost-effective policy tool. Examples include placing healthy food at eye level in cafeterias, making organ donation opt-out rather than opt-in, and automatically enrolling employees in pension schemes. Proponents claim nudging respects individual freedom while producing measurable improvements in health, financial security, and social welfare.',
        question: 'Integrated Writing Task (minimum 150 words): Summarize the points made in the listening lecture and explain how they relate to or extend the arguments made in the reading passage above.',
        options: [], correct_answer: -1, explanation: ''
      },
      {
        id: 20, section: 'Writing', type: 'academic-discussion',
        passage: null,
        question: `Academic Discussion Task (minimum 100 words):\n\nProfessor Walsh: This week we are considering whether governments should use AI-powered tools to personalise public services — for example, using AI to predict which students need extra support, or which citizens are at risk of health problems. What is your position?\n\nLena: I think it's a powerful idea. Early identification means earlier intervention, which saves money and improves outcomes for people who might otherwise fall through the cracks.\n\nCarlos: I'm concerned about privacy and the risk of algorithmic bias. If the AI was trained on biased historical data, it could systematically disadvantage already vulnerable groups.\n\nWrite your own contribution to this discussion, presenting a new argument or supporting one of the existing views with reasons and examples.`,
        options: [], correct_answer: -1, explanation: ''
      },
    ];
  }
}
