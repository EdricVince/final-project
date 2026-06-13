import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { GetListeningDto, CefrLevel, ListeningType } from './dto/skills.dto';

@Injectable()
export class ListeningService {
  private readonly logger = new Logger(ListeningService.name);
  private readonly client: Anthropic | null;

  constructor(private config: ConfigService) {
    const key = this.config.get<string>('ANTHROPIC_API_KEY');
    this.client = key && !key.includes('your-') ? new Anthropic({ apiKey: key }) : null;
  }

  async getExercise(dto: GetListeningDto) {
    const level = dto.level ?? 'B1';
    const type = dto.type ?? 'monologue';
    if (this.client) return this.generateExercise(level, type);
    return this.fallbackExercise(level, type);
  }

  private async generateExercise(level: CefrLevel, type: ListeningType) {
    const typeDesc: Record<ListeningType, string> = {
      conversation: 'a natural dialogue between 2 people (label speakers as "A:" and "B:")',
      monologue: 'a monologue or short talk',
      ielts: 'an IELTS Listening section script (interview or talk)',
      toeic: 'a TOEIC Listening script (announcement, conversation, or short talk)',
      lecture: 'an academic lecture excerpt',
    };
    const wordCount: Record<CefrLevel, number> = { A1: 80, A2: 130, B1: 200, B2: 280, C1: 350, C2: 420 };

    const prompt = `Generate a ${level}-level listening exercise as ${typeDesc[type]}.
Return ONLY valid JSON:
{
  "id": "l_${Date.now()}",
  "title": "Exercise title",
  "type": "${type}",
  "level": "${level}",
  "duration_seconds": 90,
  "script": "Full script text (~${wordCount[level]} words). Natural spoken English appropriate for ${level} listeners.",
  "speakers": ["Speaker A", "Speaker B"],
  "questions": [
    {
      "id": 1,
      "question": "Question?",
      "options": ["A. option", "B. option", "C. option", "D. option"],
      "correct": 0,
      "explanation": "Explanation"
    }
  ],
  "key_phrases": [
    {"phrase": "phrase", "meaning": "meaning"}
  ]
}
Generate 4 comprehension questions. Key phrases: 3-4 items.`;

    try {
      const msg = await this.client!.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = (msg.content[0] as any).text;
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      return json ? JSON.parse(json) : this.fallbackExercise(level, type);
    } catch (e) {
      this.logger.error('Listening generation failed', e);
      return this.fallbackExercise(level, type);
    }
  }

  private fallbackExercise(level: CefrLevel, type: ListeningType) {
    return {
      id: `l_fallback_${Date.now()}`,
      title: 'A Job Interview',
      type,
      level,
      duration_seconds: 95,
      script: `Interviewer: Good morning, Ms. Chen. Please have a seat. Thank you for coming in today.\n\nMs. Chen: Good morning. Thank you for the opportunity. I'm very excited about this position.\n\nInterviewer: Tell me a little about yourself and why you're interested in working for our company.\n\nMs. Chen: Of course. I have five years of experience in marketing, specializing in digital campaigns and social media strategy. I've followed your company's growth closely, and I'm particularly impressed by your commitment to sustainable practices and innovation.\n\nInterviewer: That's great to hear. Can you describe a successful project you led at your previous company?\n\nMs. Chen: Certainly. I led a product launch campaign that increased our social media engagement by 40% and resulted in a 25% boost in online sales over three months. I coordinated a team of six and managed a budget of $50,000.\n\nInterviewer: Impressive results. What do you consider your greatest professional strength?\n\nMs. Chen: I would say my ability to analyze data and translate insights into actionable strategies. I believe decisions should be driven by evidence, not just intuition.\n\nInterviewer: We have one more round of interviews next week. Would you be available?\n\nMs. Chen: Absolutely. I'm available any day next week. Just let me know the time that works best for your team.`,
      speakers: ['Interviewer', 'Ms. Chen'],
      questions: [
        { id: 1, question: 'How many years of experience does Ms. Chen have?', options: ['A. Three years', 'B. Four years', 'C. Five years', 'D. Six years'], correct: 2, explanation: 'Ms. Chen says "I have five years of experience in marketing."' },
        { id: 2, question: 'By how much did Ms. Chen increase social media engagement?', options: ['A. 25%', 'B. 30%', 'C. 35%', 'D. 40%'], correct: 3, explanation: 'She mentions the campaign "increased our social media engagement by 40%."' },
        { id: 3, question: 'What does Ms. Chen say is her greatest strength?', options: ['A. Team leadership', 'B. Budget management', 'C. Data analysis and strategy', 'D. Creative writing'], correct: 2, explanation: 'She states "my ability to analyze data and translate insights into actionable strategies."' },
        { id: 4, question: 'When is the next round of interviews?', options: ['A. Tomorrow', 'B. This week', 'C. Next week', 'D. Next month'], correct: 2, explanation: 'The interviewer says "We have one more round of interviews next week."' },
      ],
      key_phrases: [
        { phrase: 'follow closely', meaning: 'to pay careful attention to something over time' },
        { phrase: 'translate insights into', meaning: 'to convert understanding/knowledge into practical actions' },
        { phrase: 'driven by evidence', meaning: 'based on facts and data rather than feelings' },
      ],
    };
  }
}
