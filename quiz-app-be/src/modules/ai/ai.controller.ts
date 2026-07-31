import { Controller, Get, Post, Body, UseGuards, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtGuard } from '../../core/guards/jwt.guard';
import { AiService, WordOfTheDay, ImportedContent, VocabularyItem } from './ai.service';
import { IsOptional, IsString, IsInt, IsArray, Min, Max } from 'class-validator';

class ScanContentDto {
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsString() text?: string;
  @IsOptional() @IsString() language?: string;
}

class GenerateVocabDto {
  @IsString() learningLang!: string;
  @IsString() uiLang!: string;
  @IsOptional() @IsInt() @Min(1) @Max(30) count?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) exclude?: string[];
}

@Controller('api/v1/ai')
@UseGuards(JwtGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('word-of-the-day')
  async getWordOfTheDay(): Promise<{ code: number; message: string; data: WordOfTheDay }> {
    const data = await this.aiService.getWordOfTheDay();
    return { code: 200, message: 'Word of the day', data };
  }

  @Post('vocabulary')
  async generateVocabulary(@Body() dto: GenerateVocabDto): Promise<{ code: number; message: string; data: VocabularyItem[] }> {
    const data = await this.aiService.generateVocabulary(dto);
    return { code: 200, message: 'Vocabulary generated', data };
  }

  @Post('import/scan')
  async scanContent(@Body() dto: ScanContentDto): Promise<{ code: number; data: ImportedContent }> {
    if (!dto.url && !dto.text) {
      throw new BadRequestException('Provide either a URL or text content.');
    }
    try {
      const data = await this.aiService.scanContent(dto);
      return { code: 200, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to scan content';
      throw new InternalServerErrorException(msg);
    }
  }
}
