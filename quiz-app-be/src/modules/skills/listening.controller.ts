import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../core/guards/jwt.guard';
import { ListeningService } from './listening.service';
import { GetListeningDto } from './dto/skills.dto';

@Controller('api/v1/skills/listening')
@UseGuards(JwtGuard)
export class ListeningController {
  constructor(private readonly listening: ListeningService) {}

  @Get('exercise')
  async getExercise(@Query() dto: GetListeningDto) {
    const data = await this.listening.getExercise(dto);
    return { code: 200, message: 'Exercise generated', data };
  }
}
