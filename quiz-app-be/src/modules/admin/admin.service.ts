import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserProgress } from '../progress/entities/user-progress.entity';
import { DailyActivity } from '../progress/entities/daily-activity.entity';
import { LessonCompletion } from '../progress/entities/lesson-completion.entity';
import { Class } from '../classes/entities/class.entity';
import { ClassEnrollment } from '../classes/entities/class-enrollment.entity';
import { Video } from '../videos/entities/video.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { VocabSet } from '../vocab-sets/entities/vocab-set.entity';
import { FlashcardDeck } from '../flashcard-decks/entities/flashcard-deck.entity';
import { Test } from '../tests/entities/test.entity';
import { TestSubmission } from '../tests/entities/test-submission.entity';
import { Assignment } from '../assignments/entities/assignment.entity';
import { LiveSession } from '../live-quiz/entities/live-session.entity';
import { UserGoalSettings } from '../goals/entities/user-goal-settings.entity';
import { UserCustomGoal } from '../goals/entities/user-custom-goal.entity';
import { ROLE_STUDENT, ROLE_TEACHER } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const TEACHER_DOMAIN = '@teacher.sprk';

/** An admin-registered AI feature, persisted to a JSON file next to the app. */
interface CustomAiFeature { id: string; name: string; key: string; created_at: string }

export interface AiFeatureRow {
  id: string; name: string; enabled: boolean; key_preview: string | null; custom: true; created_at: string;
}

export interface AdminUserRow {
  id: number; email: string; name: string | null;
  role_id: number; is_active: boolean; created_at: Date; xp: number;
  is_verified: boolean; has_teacher_card: boolean;
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
      is_verified: u.is_verified,
      has_teacher_card: !!u.teacher_card_image,
    }));
  }

  async createTeacher(
    teacherName: string,
    password: string,
    customEmail?: string,
    teacherCardImage?: string,
  ): Promise<{ id: number; email: string }> {
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
      // Dropping a teacher ID card at creation marks the account as verified.
      teacher_card_image: teacherCardImage ?? null,
      is_verified: !!teacherCardImage,
    });
    const saved = await this.userRepo.save(user);
    return { id: saved.id, email: saved.email };
  }

  async getTeacherCard(userId: number): Promise<string | null> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user.teacher_card_image;
  }

  async setTeacherCard(userId: number, image: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    // Uploading a card also verifies the teacher.
    await this.userRepo.update(userId, { teacher_card_image: image, is_verified: true });
  }

  async setUserVerified(userId: number, verified: boolean): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.update(userId, { is_verified: verified });
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

  async getUserProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const progress = await this.progressRepo.findOne({ where: { user_id: userId } });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar ?? null,
      role_id: user.role_id,
      is_active: user.is_active,
      is_verified: user.is_verified,
      has_teacher_card: !!user.teacher_card_image,
      created_at: user.created_at,
      xp: progress?.xp ?? 0,
      level: progress?.level ?? 1,
      streak_count: progress?.streak_count ?? 0,
      longest_streak: progress?.longest_streak ?? 0,
      total_cards_studied: progress?.total_cards_studied ?? 0,
      total_quizzes_completed: progress?.total_quizzes_completed ?? 0,
    };
  }

  /** Delete many users in one call; missing ids are skipped. Returns how many were removed. */
  async deleteUsers(ids: number[]): Promise<number> {
    let deleted = 0;
    for (const id of ids) {
      try {
        await this.deleteUser(id);
        deleted++;
      } catch {
        // Skip ids that no longer exist so a partial batch still succeeds.
      }
    }
    return deleted;
  }

  // ── Custom AI features (admin-registered, persisted to a JSON file) ────────────

  private aiFeaturesFile(): string {
    return path.join(process.cwd(), 'ai-features.json');
  }

  private readAiFeatures(): CustomAiFeature[] {
    try {
      const p = this.aiFeaturesFile();
      if (!fs.existsSync(p)) return [];
      const parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
      return Array.isArray(parsed) ? (parsed as CustomAiFeature[]) : [];
    } catch {
      return [];
    }
  }

  private writeAiFeatures(list: CustomAiFeature[]): void {
    try {
      fs.writeFileSync(this.aiFeaturesFile(), JSON.stringify(list, null, 2), 'utf-8');
    } catch {
      // Non-fatal — a read-only FS just means custom features don't persist across restarts.
    }
  }

  private toFeatureRow(f: CustomAiFeature): AiFeatureRow {
    return {
      id: f.id,
      name: f.name,
      enabled: !!f.key && f.key.startsWith('sk-ant-'),
      key_preview: f.key ? `sk-ant-...${f.key.slice(-6)}` : null,
      custom: true,
      created_at: f.created_at,
    };
  }

  listAiFeatures(): AiFeatureRow[] {
    return this.readAiFeatures().map((f) => this.toFeatureRow(f));
  }

  addAiFeature(name: string, key: string): AiFeatureRow {
    const list = this.readAiFeatures();
    const feature: CustomAiFeature = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      key: key.trim(),
      created_at: new Date().toISOString(),
    };
    list.push(feature);
    this.writeAiFeatures(list);
    return this.toFeatureRow(feature);
  }

  removeAiFeature(id: string): void {
    const list = this.readAiFeatures();
    const next = list.filter((f) => f.id !== id);
    if (next.length === list.length) throw new NotFoundException('Feature not found');
    this.writeAiFeatures(next);
  }

  /**
   * Permanently delete a user AND every record tied to them, atomically.
   * There are no DB-level foreign keys, so this cascade is enforced here:
   * nothing this account owns or produced may survive its deletion.
   */
  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepo.manager.transaction(async (m) => {
      // Classes this teacher owns → drop their enrollments, then the classes.
      const owned = await m.find(Class, { where: { teacher_id: userId }, select: ['id'] });
      const classIds = owned.map(c => c.id);
      if (classIds.length) {
        await m.delete(ClassEnrollment, { class_id: In(classIds) });
        await m.delete(Class, { id: In(classIds) });
      }

      // This user's own enrollments (when they are a student).
      await m.delete(ClassEnrollment, { student_id: userId });

      // Content authored by this teacher.
      await m.delete(Video, { teacher_id: userId });
      await m.delete(Lesson, { teacher_id: userId });
      await m.delete(VocabSet, { teacher_id: userId });
      await m.delete(FlashcardDeck, { owner_id: userId });
      await m.delete(TestSubmission, { student_id: userId });
      await m.delete(Test, { teacher_id: userId });
      await m.delete(Assignment, { teacher_id: userId });
      await m.delete(LiveSession, { teacher_id: userId });

      // Personal learning data.
      await m.delete(UserProgress, { user_id: userId });
      await m.delete(DailyActivity, { user_id: userId });
      await m.delete(LessonCompletion, { user_id: userId });
      await m.delete(UserGoalSettings, { user_id: userId });
      await m.delete(UserCustomGoal, { user_id: userId });

      // Finally the account itself.
      await m.delete(User, { id: userId });
    });
  }
}
