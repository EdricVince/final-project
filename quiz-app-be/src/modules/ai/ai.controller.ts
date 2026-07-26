import { Controller, Get, Post, Body, UseGuards, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtGuard } from '../../core/guards/jwt.guard';
import { AiService, WordOfTheDay, ImportedContent } from './ai.service';
import { IsOptional, IsString } from 'class-validator';

class ScanContentDto {
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsString() text?: string;
  @IsOptional() @IsString() language?: string;
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
