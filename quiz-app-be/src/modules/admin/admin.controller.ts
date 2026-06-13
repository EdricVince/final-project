import {
  Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../core/guards/admin.guard';
import { IsString, IsBoolean, MinLength } from 'class-validator';

class CreateTeacherDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  email?: string;
}

class SetActiveDto {
  @IsBoolean()
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

  @Get('stats')
  async getStats() {
    const data = await this.adminService.getStats();
    return { code: 200, message: 'Stats retrieved', data };
  }

  @Get('users')
  async listUsers() {
    const users = await this.adminService.listUsers();
    return { code: 200, message: 'Users retrieved', data: users };
  }

  @Post('create-teacher')
  @HttpCode(HttpStatus.CREATED)
  async createTeacher(@Body() dto: CreateTeacherDto) {
    const result = await this.adminService.createTeacher(dto.name, dto.password, dto.email);
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

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteUser(id);
    return { code: 200, message: `User ${id} deleted`, data: null };
  }
}
