import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../core/guards/jwt.guard';
import { EntranceExamService } from './entrance-exam.service';
import { StartExamDto, SubmitExamDto } from './dto/exam.dto';

@Controller('api/v1/entrance-exam')
@UseGuards(JwtGuard)
export class EntranceExamController {
  constructor(private readonly service: EntranceExamService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() dto: StartExamDto) {
    const result = await this.service.generateExam(dto);
    return { code: 200, message: 'Exam generated', data: result };
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  submit(@Body() dto: SubmitExamDto) {
    const result = this.service.evaluateExam(dto);
    return { code: 200, message: 'Exam evaluated', data: result };
  }

}
