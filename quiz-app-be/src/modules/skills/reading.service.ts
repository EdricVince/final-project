import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { GetReadingDto, CefrLevel, ReadingType } from './dto/skills.dto';

@Injectable()
export class ReadingService {
  private readonly logger = new Logger(ReadingService.name);
  private readonly client: Anthropic | null;

  constructor(private config: ConfigService) {
    const key = this.config.get<string>('ANTHROPIC_API_KEY');
    this.client = key && !key.includes('your-') ? new Anthropic({ apiKey: key }) : null;
  }

  async getPassage(dto: GetReadingDto) {
    const level = dto.level ?? 'B1';
    const type = dto.type ?? 'ielts';
    if (this.client) return this.generatePassage(level, type, dto.topic);
    return this.fallbackPassage(level, type);
  }

  private async generatePassage(level: CefrLevel, type: ReadingType, topic?: string) {
    const typeDesc: Record<ReadingType, string> = {
      story: 'an engaging English short story',
      ielts: 'an IELTS Academic reading passage',
      toeic: 'a TOEIC business reading passage (memo, email, or article)',
      academic: 'an academic research-style article',
      news: 'a news article',
    };
    const wordCount: Record<CefrLevel, number> = { A1: 120, A2: 180, B1: 280, B2: 380, C1: 480, C2: 550 };

    const prompt = `Generate a ${level}-level reading exercise as ${typeDesc[type]}.
${topic ? `The passage should be about or inspired by: ${topic}. ` : ''}

Return ONLY valid JSON (no markdown):
{
  "id": "r_${Date.now()}",
  "title": "passage title",
  "type": "${type}",
  "level": "${level}",
  "estimated_time": 8,
  "word_count": ${wordCount[level]},
  "passage": "Full passage text (~${wordCount[level]} words). Use vocabulary and grammar appropriate for ${level}.",
  "vocabulary": [
    {"word": "word", "phonetic": "/fəˈnetɪk/", "meaning": "definition", "example": "example sentence"}
  ],
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Question text?",
      "options": ["A. option", "B. option", "C. option", "D. option"],
      "correct": 0,
      "explanation": "Why this answer is correct"
    }
  ],
  "summary": "Brief 2-sentence summary of the passage"
}

Generate 5 comprehension questions. Vocabulary list: 4-6 key words.`;

    try {
      const msg = await this.client!.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = (msg.content[0] as any).text;
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      return json ? JSON.parse(json) : this.fallbackPassage(level, type);
    } catch (e) {
      this.logger.error('Reading generation failed', e);
      return this.fallbackPassage(level, type);
    }
  }

  private fallbackPassage(level: CefrLevel, type: ReadingType) {
    return {
      id: `r_fallback_${Date.now()}`,
      title: 'The Future of Remote Work',
      type,
      level,
      estimated_time: 8,
      word_count: 280,
      passage: `Remote work has transformed the modern workplace in ways that few could have predicted a decade ago. The COVID-19 pandemic accelerated a shift that was already underway, forcing millions of employees and employers to adapt to new ways of working.\n\nStudies conducted in 2022 and 2023 show that productivity among remote workers has, in many cases, actually increased compared to office-based work. Employees save time on commuting, which can amount to several hours per week, and many report higher job satisfaction and better work-life balance.\n\nHowever, remote work is not without its challenges. Many workers struggle with feelings of isolation, and the boundary between professional and personal life can become blurred when working from home. Collaboration and spontaneous communication, which are easy in an office environment, require more deliberate effort in a remote setting.\n\nCompanies are now exploring hybrid models that combine the flexibility of remote work with the collaborative benefits of in-person interaction. This approach appears to satisfy both employers who value team cohesion and employees who appreciate autonomy and flexibility.\n\nThe long-term impact of remote work on urban planning, commercial real estate, and even family structures is still unfolding. What is clear, however, is that the traditional nine-to-five, office-based workday may never fully return.`,
      vocabulary: [
        { word: 'accelerated', phonetic: '/əkˈseləreɪtɪd/', meaning: 'increased in speed or rate', example: 'The pandemic accelerated the adoption of digital tools.' },
        { word: 'spontaneous', phonetic: '/spɒnˈteɪniəs/', meaning: 'happening naturally without planning', example: 'Spontaneous discussions often lead to creative ideas.' },
        { word: 'cohesion', phonetic: '/kəʊˈhiːʒən/', meaning: 'the action of forming a united whole', example: 'Team cohesion improved after the workshop.' },
        { word: 'autonomy', phonetic: '/ɔːˈtɒnəmi/', meaning: 'the right to self-governance; independence', example: 'Employees value autonomy in managing their schedules.' },
      ],
      questions: [
        { id: 1, type: 'multiple_choice', question: 'What was the primary catalyst for the widespread adoption of remote work?', options: ['A. Technological advancements', 'B. The COVID-19 pandemic', 'C. Employee demand', 'D. Cost reduction'], correct: 1, explanation: 'The passage states "The COVID-19 pandemic accelerated a shift that was already underway."' },
        { id: 2, type: 'multiple_choice', question: 'According to the passage, what is one benefit of remote work for employees?', options: ['A. Higher salaries', 'B. Better office equipment', 'C. Time saved on commuting', 'D. More social interaction'], correct: 2, explanation: 'The passage mentions "Employees save time on commuting, which can amount to several hours per week."' },
        { id: 3, type: 'multiple_choice', question: 'What challenge do remote workers commonly face?', options: ['A. Lower productivity', 'B. Feelings of isolation', 'C. Inadequate technology', 'D. Longer working hours'], correct: 1, explanation: 'The passage says "many workers struggle with feelings of isolation."' },
        { id: 4, type: 'multiple_choice', question: 'What does the "hybrid model" refer to?', options: ['A. Working only from home', 'B. A combination of remote and in-person work', 'C. Working in multiple offices', 'D. Part-time employment'], correct: 1, explanation: 'The passage describes hybrid models as combining "the flexibility of remote work with the collaborative benefits of in-person interaction."' },
        { id: 5, type: 'multiple_choice', question: 'What does the author suggest about the traditional office workday?', options: ['A. It will completely disappear', 'B. It will become more popular', 'C. It may never fully return', 'D. It remains unchanged'], correct: 2, explanation: 'The passage concludes "the traditional nine-to-five, office-based workday may never fully return."' },
      ],
      summary: 'Remote work has grown significantly, offering benefits like saved commute time and higher job satisfaction. Companies are now adopting hybrid models to balance flexibility and collaboration.',
    };
  }
}
