import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveSession } from './entities/live-session.entity';

// A live lesson is a sequence of presentation steps the teacher walks through.
export interface StepDto {
  title: string;
  body: string;
}

@Injectable()
export class LiveQuizService {
  constructor(
    @InjectRepository(LiveSession)
    private sessionRepo: Repository<LiveSession>,
  ) {}

  private generatePin(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 6);
  }

  async create(teacherId: number, title: string, classId?: number, steps: StepDto[] = []): Promise<LiveSession> {
    let pin = this.generatePin();
    // Ensure a unique pin among sessions still open.
    while (await this.sessionRepo.findOne({ where: { pin, status: 'waiting' } })) {
      pin = this.generatePin();
    }
    const session = this.sessionRepo.create({
      teacher_id: teacherId,
      class_id: classId ?? null,
      title,
      pin,
      steps: JSON.stringify(steps),
      status: 'waiting',
      current_question: 0,
    });
    return this.sessionRepo.save(session);
  }

  async findByTeacher(teacherId: number): Promise<LiveSession[]> {
    return this.sessionRepo.find({
      where: { teacher_id: teacherId },
      order: { created_at: 'DESC' },
    });
  }

  async findByPin(pin: string): Promise<LiveSession> {
    const session = await this.sessionRepo.findOne({ where: { pin } });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async findOne(id: number): Promise<LiveSession> {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async updateStatus(id: number, teacherId: number, status: string): Promise<LiveSession> {
    const session = await this.findOne(id);
    if (session.teacher_id !== teacherId) throw new BadRequestException('Not your session');
    session.status = status;
    return this.sessionRepo.save(session);
  }

  async delete(id: number, teacherId: number): Promise<void> {
    const session = await this.findOne(id);
    if (session.teacher_id !== teacherId) throw new BadRequestException('Not your session');
    await this.sessionRepo.delete(id);
  }

  parseSteps(session: LiveSession): StepDto[] {
    try {
      const parsed = JSON.parse(session.steps || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
