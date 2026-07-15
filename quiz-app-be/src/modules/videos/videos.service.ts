import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';

export class CreateVideoDto {
  class_id?: number;
  title: string;
  description?: string;
  video_url: string;
  lesson_name?: string;
  duration?: number;
}

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videoRepo: Repository<Video>,
  ) {}

  async create(teacherId: number, dto: CreateVideoDto): Promise<Video> {
    const video = this.videoRepo.create({
      teacher_id: teacherId,
      class_id: dto.class_id ?? null,
      title: dto.title,
      description: dto.description ?? null,
      video_url: dto.video_url,
      lesson_name: dto.lesson_name ?? null,
      duration: dto.duration ?? 0,
      is_published: true,
    });
    return this.videoRepo.save(video);
  }

  async findAll(classId?: number, teacherId?: number): Promise<Video[]> {
    const where: any = {};
    if (classId) where.class_id = classId;
    if (teacherId) where.teacher_id = teacherId;
    return this.videoRepo.find({ where, order: { created_at: 'DESC' } });
  }

  async findOne(id: number): Promise<Video> {
    const video = await this.videoRepo.findOne({ where: { id } });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async update(id: number, teacherId: number, dto: Partial<CreateVideoDto>): Promise<Video> {
    const video = await this.findOne(id);
    if (video.teacher_id !== teacherId) throw new ForbiddenException('Not your video');
    Object.assign(video, dto);
    return this.videoRepo.save(video);
  }

  async remove(id: number, teacherId: number): Promise<void> {
    const video = await this.findOne(id);
    if (video.teacher_id !== teacherId) throw new ForbiddenException('Not your video');
    await this.videoRepo.delete(id);
  }
}
