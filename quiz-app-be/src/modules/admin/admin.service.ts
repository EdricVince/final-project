import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserProgress } from '../progress/entities/user-progress.entity';
import { ROLE_STUDENT, ROLE_TEACHER } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

const TEACHER_DOMAIN = '@teacher.sprk';

export interface AdminUserRow {
  id: number; email: string; name: string | null;
  role_id: number; is_active: boolean; created_at: Date; xp: number;
}

export interface AdminStats {
  total: number; students: number; teachers: number;
  active: number; newThisWeek: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserProgress)
    private progressRepo: Repository<UserProgress>,
  ) {}

  async getStats(): Promise<AdminStats> {
    const users = await this.userRepo.find();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return {
      total: users.length,
      students: users.filter(u => u.role_id === ROLE_STUDENT).length,
      teachers: users.filter(u => u.role_id === ROLE_TEACHER).length,
      active: users.filter(u => u.is_active).length,
      newThisWeek: users.filter(u => new Date(u.created_at) >= weekAgo).length,
    };
  }

  async listUsers(): Promise<AdminUserRow[]> {
    const users = await this.userRepo.find({ order: { created_at: 'DESC' } });
    const progressList = await this.progressRepo.find();
    const progressMap = new Map(progressList.map(p => [p.user_id, p]));

    return users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role_id: u.role_id,
      is_active: u.is_active,
      created_at: u.created_at,
      xp: progressMap.get(u.id)?.xp ?? 0,
    }));
  }

  async createTeacher(teacherName: string, password: string, customEmail?: string): Promise<{ id: number; email: string }> {
    const email = customEmail ?? `${teacherName.toLowerCase().replace(/\s+/g, '.')}${TEACHER_DOMAIN}`;

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException(`Teacher account "${email}" already exists`);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      name: teacherName,
      role_id: ROLE_TEACHER,
      is_active: true,
    });
    const saved = await this.userRepo.save(user);
    return { id: saved.id, email: saved.email };
  }

  async setUserActive(userId: number, isActive: boolean): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.update(userId, { is_active: isActive });
  }

  async resetUserPassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const hashed = await bcrypt.hash(newPassword, 12);
    await this.userRepo.update(userId, { password: hashed });
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    // Delete related records first to avoid FK constraint violations
    await this.progressRepo.delete({ user_id: userId });
    await this.userRepo.delete(userId);
  }
}
