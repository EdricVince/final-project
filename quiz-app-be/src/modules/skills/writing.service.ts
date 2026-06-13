import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { GetWritingPromptDto, SubmitWritingDto, CefrLevel, WritingType } from './dto/skills.dto';
import { WRITING_PROMPTS } from '../../writing-prompts';
import { WRITING_IMAGES } from '../../writing-images';

@Injectable()
export class WritingService {
  private readonly logger = new Logger(WritingService.name);
  private readonly client: Anthropic | null;

  constructor(private config: ConfigService) {
    const key = this.config.get<string>('ANTHROPIC_API_KEY');
    this.client = key && !key.includes('your-') ? new Anthropic({ apiKey: key }) : null;
  }

  async getPrompt(dto: GetWritingPromptDto) {
    const type = dto.type ?? 'general';
    const level = dto.level ?? 'B1';
    if (this.client) return this.generatePrompt(type, level);
    return this.fallbackPrompt(type, level);
  }

  async submitEssay(dto: SubmitWritingDto) {
    if (this.client) return this.evaluateEssay(dto);
    return this.fallbackEvaluation(dto);
  }

  private async generatePrompt(type: WritingType, level: CefrLevel) {
    const typeDesc: Record<WritingType, string> = {
      ielts_task1: 'IELTS Academic Writing Task 1 (describe a graph, chart, diagram, or map)',
      ielts_task2: 'IELTS Writing Task 2 (argumentative or discursive essay)',
      toeic: 'TOEIC Writing (email response or opinion essay)',
      general: 'general English writing task (letter, description, or opinion)',
    };
    const timeLimit: Record<WritingType, number> = {
      ielts_task1: 20, ielts_task2: 40, toeic: 30, general: 25,
    };
    const wordTarget: Record<WritingType, string> = {
      ielts_task1: '150 words minimum', ielts_task2: '250 words minimum',
      toeic: '100-200 words', general: '150-250 words',
    };

    const prompt = `Generate a ${level}-level ${typeDesc[type]} writing prompt.
Return ONLY valid JSON:
{
  "id": "w_${Date.now()}",
  "type": "${type}",
  "level": "${level}",
  "title": "Short task title",
  "prompt": "Full writing task instructions (2-4 sentences). Be specific and clear.",
  "context": "Additional context or stimulus material (for task1: describe what to write about; for task2: background statement)",
  "time_limit_seconds": ${timeLimit[type] * 60},
  "word_target": "${wordTarget[type]}",
  "band_criteria": ["Task Achievement", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy"],
  "tips": ["tip1", "tip2", "tip3"]
}`;

    try {
      const msg = await this.client!.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = (msg.content[0] as any).text;
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      return json ? JSON.parse(json) : this.fallbackPrompt(type, level);
    } catch (e) {
      this.logger.error('Writing prompt generation failed', e);
      return this.fallbackPrompt(type, level);
    }
  }

  private async evaluateEssay(dto: SubmitWritingDto) {
    const wordCount = dto.essay.trim().split(/\s+/).length;
    const prompt = `You are an expert IELTS/TOEIC examiner. Evaluate this ${dto.type} essay.

Writing Prompt: ${dto.prompt}

Student Essay:
${dto.essay}

Word Count: ${wordCount}
Time Taken: ${Math.floor(dto.time_taken_seconds / 60)} minutes ${dto.time_taken_seconds % 60} seconds

Return ONLY valid JSON:
{
  "overall_band": 6.5,
  "scores": {
    "task_achievement": 7,
    "coherence_cohesion": 6,
    "lexical_resource": 6.5,
    "grammatical_accuracy": 6
  },
  "word_count": ${wordCount},
  "time_taken_seconds": ${dto.time_taken_seconds},
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "grammar_errors": [
    {"original": "incorrect phrase", "corrected": "correct phrase", "explanation": "why"}
  ],
  "vocabulary_feedback": {
    "good_words": ["word1", "word2"],
    "suggestions": [{"replace": "basic word", "with": "advanced alternative"}]
  },
  "corrected_paragraph": "Rewrite the weakest paragraph with corrections applied.",
  "summary": "2-sentence overall assessment."
}

Be strict but fair. grammar_errors: up to 5 most important. vocabulary suggestions: up to 3.`;

    try {
      const msg = await this.client!.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = (msg.content[0] as any).text;
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      return json ? JSON.parse(json) : this.fallbackEvaluation(dto);
    } catch (e) {
      this.logger.error('Essay evaluation failed', e);
      return this.fallbackEvaluation(dto);
    }
  }

  private fallbackPrompt(type: WritingType, level: CefrLevel) {
    const prompts = WRITING_PROMPTS[type];
    if (!prompts || prompts.length === 0) {
      return this.getDefaultFallback(type, level);
    }
    const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const result = {
      id: selectedPrompt.id,
      type: selectedPrompt.type,
      level,
      title: selectedPrompt.title,
      prompt: selectedPrompt.prompt,
      context: selectedPrompt.context,
      time_limit_seconds: selectedPrompt.time_limit_seconds,
      word_target: selectedPrompt.word_target,
      band_criteria: selectedPrompt.band_criteria,
      tips: selectedPrompt.tips,
      ...(selectedPrompt.image_key && { 
        image_key: selectedPrompt.image_key,
        image_url: `/images/writing-task1/${selectedPrompt.image_key}.svg`
      })
    };
    return result;
  }

  private getDefaultFallback(type: WritingType, level: CefrLevel) {
    const defaultPrompts: Record<WritingType, object> = {
      ielts_task2: {
        id: `w_fallback_${Date.now()}`,
        type, level,
        title: 'Technology and Human Connection',
        prompt: 'Some people believe that modern technology has made it easier for people to connect with others. Others argue that technology has made people more isolated. Discuss both views and give your own opinion.',
        context: 'In recent years, smartphones and social media have transformed how people communicate and interact on a daily basis.',
        time_limit_seconds: 2400,
        word_target: '250 words minimum',
        band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
        tips: ['Address both sides before stating your opinion', 'Use linking words: however, furthermore, on the other hand', 'Include a clear conclusion that matches your thesis'],
      },
      ielts_task1: {
        id: `w_fallback_${Date.now()}`,
        type, level,
        title: 'Online Shopping Trends',
        prompt: 'The graph below shows the percentage of people who shopped online in four countries between 2010 and 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
        context: 'A line graph showing online shopping adoption rates (%) for UK, USA, Japan, and Brazil from 2010 to 2023.',
        time_limit_seconds: 1200,
        word_target: '150 words minimum',
        band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
        tips: ['Begin with an overview before details', 'Use data to support your points (approximately, roughly, around)', 'Compare countries at key points in time'],
        image_url: '/images/writing-task1/line-graph-shopping.svg',
      },
      toeic: {
        id: `w_fallback_${Date.now()}`,
        type, level,
        title: 'Work-From-Home Policy',
        prompt: 'Your company is considering a permanent work-from-home policy. Write an email to your manager sharing your opinion on this policy and explaining how it would affect your productivity and work-life balance.',
        context: 'You work at a mid-sized marketing firm. Your manager has asked for employee feedback before the board meeting next Friday.',
        time_limit_seconds: 1800,
        word_target: '100-200 words',
        band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
        tips: ['Use formal email format with greeting and closing', 'State your position clearly in the first paragraph', 'Give 2-3 specific reasons to support your view'],
      },
      general: {
        id: `w_fallback_${Date.now()}`,
        type, level,
        title: 'A Place That Inspired You',
        prompt: 'Write about a place that has had a significant impact on your life. Describe the place, explain why it is meaningful to you, and reflect on how it has influenced who you are today.',
        context: 'This could be a place from your childhood, a place you visited, or somewhere you live now.',
        time_limit_seconds: 1500,
        word_target: '150-250 words',
        band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
        tips: ['Use descriptive language to paint a picture', 'Structure: introduction → description → impact → reflection', 'Use past and present tenses appropriately'],
      },
    };
    return defaultPrompts[type];
  }

  private fallbackEvaluation(dto: SubmitWritingDto) {
    const wordCount = dto.essay.trim().split(/\s+/).length;
    return {
      overall_band: 5.5,
      scores: { task_achievement: 5, coherence_cohesion: 6, lexical_resource: 5.5, grammatical_accuracy: 5.5 },
      word_count: wordCount,
      time_taken_seconds: dto.time_taken_seconds,
      strengths: ['Addresses the main topic', 'Basic paragraph structure is present'],
      improvements: ['Develop arguments with more specific examples', 'Use a wider range of vocabulary', 'Vary sentence structures to demonstrate grammatical range'],
      grammar_errors: [
        { original: 'There is many reasons', corrected: 'There are many reasons', explanation: 'Subject-verb agreement: "reasons" is plural, so use "are"' },
      ],
      vocabulary_feedback: {
        good_words: ['however', 'furthermore'],
        suggestions: [{ replace: 'good', with: 'beneficial / advantageous' }],
      },
      corrected_paragraph: 'AI evaluation is currently unavailable. Your essay has been saved successfully. Please try again later for detailed feedback.',
      summary: 'The essay demonstrates basic English writing ability. Focus on developing arguments with specific examples and expanding vocabulary range to improve your band score.',
    };
  }
}
