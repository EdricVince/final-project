import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtGuard } from '../../core/guards/jwt.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import type { CurrentUserData } from '../../core/decorators/current-user.decorator';
import { LogActivityDto } from './dto/log-activity.dto';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

@Controller('api/v1/progress')
@UseGuards(JwtGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('me')
  async getMyStats(@CurrentUser() user: CurrentUserData): Promise<ApiResponse<any>> {
    const data = await this.progressService.getMyStats(user.id);
    return { code: HttpStatus.OK, message: 'Progress fetched', data };
  }

  @Post('activity')
  @HttpCode(HttpStatus.OK)
  async logActivity(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: LogActivityDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.progressService.logActivity(user.id, dto);
    return { code: HttpStatus.OK, message: 'Activity logged', data };
  }

  @Get('weekly')
  async getWeeklyActivity(@CurrentUser() user: CurrentUserData): Promise<ApiResponse<any>> {
    const data = await this.progressService.getWeeklyActivity(user.id);
    return { code: HttpStatus.OK, message: 'Weekly activity fetched', data };
  }

  @Get('leaderboard')
  async getLeaderboard(): Promise<ApiResponse<any>> {
    const data = await this.progressService.getLeaderboard();
    return { code: HttpStatus.OK, message: 'Leaderboard fetched', data };
  }
}
