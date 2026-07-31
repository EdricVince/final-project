import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

export interface ImportedContent {
  title: string
  summary: string
  language: string
  vocabulary: { term: string; definition: string; example: string }[]
  quiz: { question: string; options: string[]; correct: number; explanation: string }[]
  comprehension: { question: string; answer: string }[]
}

export interface WordOfTheDay {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tip: string;
}

export interface VocabularyItem {
  term: string;
  meaning: string;
  explanation: string;
  example: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private cache: { date: string; word: WordOfTheDay } | null = null;

  constructor() {}

  private get client(): Anthropic | null {
    const key = process.env.ANTHROPIC_API_KEY ?? '';
    return key && key.startsWith('sk-ant-') ? new Anthropic({ apiKey: key }) : null;
  }

  async scanContent(dto: { url?: string; text?: string; language?: string }): Promise<ImportedContent> {
    let rawText = dto.text?.trim() || ''

    if (dto.url) {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(dto.url);
      } catch {
        throw new Error('Invalid URL format.');
      }
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported.');
      }
      const hostname = parsedUrl.hostname.toLowerCase();
      if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.|::1$|\[::1\])/.test(hostname)) {
        throw new Error('Access to private or local network addresses is not allowed.');
      }
      try {
        const res = await fetch(parsedUrl.toString(), {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StudySpark/1.0)' },
          signal: AbortSignal.timeout(10000),
        })
        const html = await res.text()
        rawText = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 12000)
      } catch (err) {
        throw new Error('Cannot fetch URL. Try pasting the text directly.')
      }
    }

    if (!rawText || rawText.length < 80) {
      throw new Error('Not enough content to analyze. Please provide more text.')
    }

    if (!this.client) {
      throw new Error('AI service not configured. Set ANTHROPIC_API_KEY in environment.')
    }

    const lang = dto.language || 'English'
    const prompt = `You are a language teacher assistant. Analyze the following text and generate structured learning content in ${lang}.
Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "title": "concise lesson title",
  "summary": "2-3 sentence summary of the main topic",
  "language": "${lang}",
  "vocabulary": [
    {"term": "keyword from text", "definition": "clear definition", "example": "natural example sentence"}
  ],
  "quiz": [
    {"question": "question about the content", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "why this is correct"}
  ],
  "comprehension": [
    {"question": "open-ended question", "answer": "ideal answer"}
  ]
}

Generate:
- 10 to 15 vocabulary items (important words/phrases from the text)
- 8 multiple-choice quiz questions testing comprehension
- 4 comprehension questions requiring short answers

TEXT:
${rawText}`

    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = (response.content[0] as { type: string; text: string }).text.trim()
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}')
      const jsonStr = text.slice(jsonStart, jsonEnd + 1)
      return JSON.parse(jsonStr) as ImportedContent
    } catch (err) {
      this.logger.error('scanContent error', err)
      throw new Error('AI failed to parse content. Please try again.')
    }
  }

  private langName(code: string): string {
    const map: Record<string, string> = {
      en: 'English',
      vi: 'Vietnamese',
      zh: 'Chinese (Simplified)',
    };
    return map[code] ?? 'English';
  }

  /**
   * Generate a fresh, diverse batch of vocabulary for flashcard practice.
   * `learningLang` is the language being studied; `uiLang` is the learner's own
   * language used for the meaning + explanation. `exclude` lets the caller skip
   * words already seen so each batch feels new.
   */
  async generateVocabulary(dto: {
    learningLang: string;
    uiLang: string;
    count?: number;
    exclude?: string[];
  }): Promise<VocabularyItem[]> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'AI service not configured. Please add your Anthropic API key in admin settings.',
      );
    }

    const count = Math.min(Math.max(dto.count ?? 15, 1), 30);
    const learn = this.langName(dto.learningLang);
    const ui = this.langName(dto.uiLang);

    // Rotate through themes so consecutive batches don't repeat the same words.
    const themes = [
      'everyday life', 'food and cooking', 'travel', 'work and office',
      'technology', 'nature and weather', 'emotions and feelings',
      'health and the body', 'shopping and money', 'education',
      'hobbies and sports', 'family and relationships', 'the city and directions',
      'time and dates', 'houses and furniture', 'arts and music',
    ];
    const pickedThemes = [...themes].sort(() => Math.random() - 0.5).slice(0, 4);
    const exclude = (dto.exclude ?? []).filter(Boolean).slice(0, 60);
    const excludeLine = exclude.length
      ? `Do NOT include any of these already-seen words: ${exclude.join(', ')}.`
      : '';

    const pinyinHint =
      dto.learningLang === 'zh'
        ? ' with pinyin in parentheses, e.g. 苹果 (píngguǒ)'
        : '';

    const prompt = `You are a ${learn} vocabulary teacher for a ${ui}-speaking learner.
Generate ${count} DIVERSE and USEFUL ${learn} vocabulary words. Spread them across varied topics (for example: ${pickedThemes.join(', ')}) and mix beginner to intermediate difficulty. Avoid the same predictable textbook words every time — make each batch feel fresh and varied.
${excludeLine}
Return ONLY a valid JSON array (no markdown, no code fences) of exactly ${count} objects with this structure:
[
  {
    "term": "the word in ${learn}${pinyinHint}",
    "meaning": "the short meaning in ${ui}",
    "explanation": "one simple, easy sentence in ${ui} explaining what the word means or when to use it, so a learner clearly understands it",
    "example": "a natural example sentence in ${learn}"
  }
]`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      const raw = (response.content[0] as { type: string; text: string }).text;
      const json = raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1);
      const items = JSON.parse(json) as VocabularyItem[];
      return items.filter((i) => i && i.term && i.meaning);
    } catch (err) {
      this.logger.error('generateVocabulary failed', err);
      throw new ServiceUnavailableException(
        'AI failed to generate vocabulary. Please try again.',
      );
    }
  }

  async getWordOfTheDay(): Promise<WordOfTheDay> {
    const today = new Date().toDateString();
    if (this.cache?.date === today) return this.cache.word;

    if (!this.client) {
      throw new ServiceUnavailableException('AI service not configured. Please add your Anthropic API key in admin settings.');
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `Generate a Word of the Day for an English learning app. Today is ${today}.
Return ONLY valid JSON (no markdown) with this exact structure:
{
  "word": "string",
  "phonetic": "IPA pronunciation",
  "partOfSpeech": "noun/verb/adjective/adverb",
  "definition": "clear definition under 20 words",
  "example": "natural example sentence",
  "synonyms": ["word1", "word2", "word3"],
  "difficulty": "beginner|intermediate|advanced",
  "tip": "fun memory trick or etymology tip"
}
Pick an interesting, useful English word. Not too common, not too obscure.`,
        }],
      });

      const raw = (response.content[0] as { type: string; text: string }).text;
      // Robustly extract the JSON object (Claude may wrap it in prose / markdown fences)
      const json = raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1);
      const word: WordOfTheDay = JSON.parse(json);
      this.cache = { date: today, word };
      return word;
    } catch (err) {
      this.logger.error('Word of the day generation failed', err);
      throw new ServiceUnavailableException('AI failed to generate the word of the day. Please try again.');
    }
  }
}
