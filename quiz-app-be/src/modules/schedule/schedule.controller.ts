import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { GenerateScheduleDto } from './dto/schedule.dto';
import { JwtGuard } from '../../core/guards/jwt.guard';

@Controller('api/v1/schedule')
@UseGuards(JwtGuard)
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() dto: GenerateScheduleDto) {
    const plan = await this.service.generatePlan(dto);
    return { code: 200, message: 'Study plan generated', data: plan };
  }
}
