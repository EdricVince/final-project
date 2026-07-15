import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../core/guards/jwt.guard';
import { ReadingService } from './reading.service';
import { GetReadingDto, SubmitReadingDto } from './dto/skills.dto';

@Controller('api/v1/skills/reading')
@UseGuards(JwtGuard)
export class ReadingController {
  constructor(private readonly reading: ReadingService) {}

  @Get('passage')
  async getPassage(@Query() dto: GetReadingDto) {
    const data = await this.reading.getPassage(dto);
    return { code: 200, message: 'Passage generated', data };
  }

  @Post('submit')
  submit(@Body() dto: SubmitReadingDto) {
    const correct = dto.answers.filter((ans, i) => ans === dto.questions[i]?.correct).length;
    const total = dto.questions.length;
    const data = { correct, total, score: Math.round((correct / total) * 100), passed: correct / total >= 0.6 };
    return { code: 200, message: 'Submitted', data };
  }
}
