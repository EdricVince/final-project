import {
  Controller, Get, Post, Patch, Body, Param, ParseIntPipe,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../core/guards/admin.guard';
import { IsString, MinLength, Matches } from 'class-validator';

class CreateTeacherDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(8)
  password: string;
}

class SetActiveDto {
  is_active: boolean;
}

class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  new_password: string;
}

@Controller('api/v1/admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async listUsers() {
    const users = await this.adminService.listUsers();
    return { code: 200, message: 'Users retrieved', data: users };
  }

  @Post('create-teacher')
  @HttpCode(HttpStatus.CREATED)
  async createTeacher(@Body() dto: CreateTeacherDto) {
    const result = await this.adminService.createTeacher(dto.name, dto.password);
    return {
      code: 201,
      message: `Teacher account created: ${result.email}`,
      data: result,
    };
  }

  @Patch('users/:id/active')
  async setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetActiveDto,
  ) {
    await this.adminService.setUserActive(id, dto.is_active);
    return { code: 200, message: `User ${id} ${dto.is_active ? 'activated' : 'deactivated'}`, data: null };
  }

  @Patch('users/:id/reset-password')
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordDto,
  ) {
    await this.adminService.resetUserPassword(id, dto.new_password);
    return { code: 200, message: 'Password reset successfully', data: null };
  }
}
