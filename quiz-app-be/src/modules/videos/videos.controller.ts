import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { VideosService, CreateVideoDto } from './videos.service';
import { JwtGuard } from '../../core/guards/jwt.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ROLE_TEACHER } from '../roles/entities/role.entity';

@Controller('api/v1/videos')
@UseGuards(JwtGuard, RolesGuard)
export class VideosController {
  constructor(private videosService: VideosService) {}

  /** Teacher: create video */
  @Post()
  @Roles(ROLE_TEACHER)
  async create(@Req() req: any, @Body() dto: CreateVideoDto) {
    const video = await this.videosService.create(req.user.id, dto);
    return { code: 201, message: 'Video created', data: video };
  }

  /** All: list videos (student filters by class_id, teacher filters by own) */
  @Get()
  async findAll(@Req() req: any, @Query('class_id') classId?: string) {
    const isTeacher = req.user.role_id === ROLE_TEACHER;
    const videos = await this.videosService.findAll(
      classId ? Number(classId) : undefined,
      isTeacher ? req.user.id : undefined,
    );
    return { code: 200, message: 'OK', data: videos };
  }

  /** All: get one video */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const video = await this.videosService.findOne(id);
    return { code: 200, message: 'OK', data: video };
  }

  /** Teacher: update video */
  @Patch(':id')
  @Roles(ROLE_TEACHER)
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateVideoDto>,
  ) {
    const video = await this.videosService.update(id, req.user.id, dto);
    return { code: 200, message: 'Updated', data: video };
  }

  /** Teacher: delete video */
  @Delete(':id')
  @Roles(ROLE_TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.videosService.remove(id, req.user.id);
  }
}
