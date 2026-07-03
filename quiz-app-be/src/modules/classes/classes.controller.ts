import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, UseGuards, Req, HttpCode, HttpStatus, ForbiddenException,
} from '@nestjs/common';
import { ClassesService, CreateClassDto, UpdateClassDto } from './classes.service';
import { AnalyticsService } from './analytics.service';
import { JwtGuard } from '../../core/guards/jwt.guard';
import { ROLE_TEACHER } from '../roles/entities/role.entity';

@Controller('api/v1/classes')
@UseGuards(JwtGuard)
export class ClassesController {
  constructor(
    private classesService: ClassesService,
    private analyticsService: AnalyticsService,
  ) {}

  /** GET /classes/analytics — teacher analytics dashboard */
  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    if (req.user.role_id !== ROLE_TEACHER) throw new ForbiddenException('Teacher access required');
    const data = await this.analyticsService.getTeacherAnalytics(req.user.id);
    return { code: 200, message: 'OK', data };
  }

  /** GET /classes — teacher: own classes; student: enrolled classes */
  @Get()
  async findAll(@Req() req: any) {
    const classes = await this.classesService.findAll(req.user.id, req.user.role_id);
    return { code: 200, message: 'OK', data: classes };
  }

  /** POST /classes — teacher creates a class */
  @Post()
  async create(@Req() req: any, @Body() dto: CreateClassDto) {
    const cls = await this.classesService.create(req.user.id, dto);
    return { code: 201, message: 'Class created', data: cls };
  }

  /** POST /classes/join — student joins by class code */
  @Post('join')
  async join(@Req() req: any, @Body() body: { class_code: string }) {
    const cls = await this.classesService.joinClass(body.class_code, req.user.id);
    return { code: 200, message: 'Joined class', data: cls };
  }

  /** GET /classes/:id */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cls = await this.classesService.findOne(id);
    return { code: 200, message: 'OK', data: cls };
  }

  /** PUT /classes/:id — teacher updates class */
  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassDto,
  ) {
    const cls = await this.classesService.update(id, req.user.id, dto);
    return { code: 200, message: 'Updated', data: cls };
  }

  /** DELETE /classes/:id — teacher deletes class */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.classesService.delete(id, req.user.id);
  }

  /** GET /classes/:id/students */
  @Get(':id/students')
  async getStudents(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const students = await this.classesService.getStudents(id, req.user.id);
    return { code: 200, message: 'OK', data: students };
  }

  /** DELETE /classes/:id/students/:studentId */
  @Delete(':id/students/:studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeStudent(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    await this.classesService.removeStudent(id, studentId, req.user.id);
  }
}
