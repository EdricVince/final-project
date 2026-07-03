import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../core/guards/jwt.guard';
import { WritingService } from './writing.service';
import { GetWritingPromptDto, SubmitWritingDto } from './dto/skills.dto';

@Controller('api/v1/skills/writing')
@UseGuards(JwtGuard)
export class WritingController {
  constructor(private readonly writing: WritingService) {}

  @Get('prompt')
  async getPrompt(@Query() dto: GetWritingPromptDto) {
    const data = await this.writing.getPrompt(dto);
    return { code: 200, message: 'Prompt generated', data };
  }

  @Post('submit')
  async submit(@Body() dto: SubmitWritingDto) {
    const data = await this.writing.submitEssay(dto);
    return { code: 200, message: 'Evaluated', data };
  }
}
