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
