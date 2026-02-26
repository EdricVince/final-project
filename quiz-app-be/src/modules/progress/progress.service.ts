import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from './entities/user-progress.entity';
import { DailyActivity } from './entities/daily-activity.entity';
import { User } from '../users/entities/user.entity';
import {
  LogActivityDto,
  LogActivityResponseDto,
} from './dto/log-activity.dto';
import {
  ProgressResponseDto,
  WeeklyActivityItemDto,
} from './dto/progress-response.dto';
import { LeaderboardItemDto } from './dto/leaderboard-item.dto';

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLevel(xp: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return Math.min(level, 10);
}

function getXpBounds(level: number): { current: number; next: number } {
  const idx = Math.min(level - 1, LEVEL_THRESHOLDS.length - 1);
  const nextIdx = Math.min(level, LEVEL_THRESHOLDS.length - 1);
  return {
    current: LEVEL_THRESHOLDS[idx],
    next: level >= 10 ? LEVEL_THRESHOLDS[9] : LEVEL_THRESHOLDS[nextIdx],
  };
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function calculateXpGained(dto: LogActivityDto): number {
  if (dto.type === 'flashcard_session') {
    const cards = dto.cards_count ?? 0;
    return Math.min(cards * 5, 100);
  }
  if (dto.type === 'quiz_completion') {
    const score = dto.score ?? 0;
    return 25 + Math.floor((score / 100) * 25);
  }
  return 0;
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private progressRepo: Repository<UserProgress>,
    @InjectRepository(DailyActivity)
    private dailyRepo: Repository<DailyActivity>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private async getOrCreateProgress(userId: number): Promise<UserProgress> {
    let progress = await this.progressRepo.findOne({ where: { user_id: userId } });
    if (!progress) {
      progress = this.progressRepo.create({ user_id: userId });
      await this.progressRepo.save(progress);
    }
    return progress;
  }

  private async getTodayActivity(userId: number): Promise<DailyActivity> {
    const today = getTodayString();
    let activity = await this.dailyRepo.findOne({
      where: { user_id: userId, activity_date: today },
    });
    if (!activity) {
      activity = this.dailyRepo.create({ user_id: userId, activity_date: today });
      await this.dailyRepo.save(activity);
    }
    return activity;
  }

  async logActivity(userId: number, dto: LogActivityDto): Promise<LogActivityResponseDto> {
    const progress = await this.getOrCreateProgress(userId);
    const todayActivity = await this.getTodayActivity(userId);
    const today = getTodayString();
    const xpGained = calculateXpGained(dto);

    // Update streak
    let streakUpdated = false;
    if (progress.last_activity_date !== today) {
      if (progress.last_activity_date === getYesterdayString()) {
        progress.streak_count += 1;
      } else {
        progress.streak_count = 1;
      }
      progress.last_activity_date = today;
      streakUpdated = true;
      if (progress.streak_count > progress.longest_streak) {
        progress.longest_streak = progress.streak_count;
      }
    }

    // Update XP & level
    const oldLevel = progress.level;
    progress.xp += xpGained;
    progress.level = getLevel(progress.xp);
    const levelUp = progress.level > oldLevel;

    // Update total counts
    if (dto.type === 'flashcard_session') {
      progress.total_cards_studied += dto.cards_count ?? 0;
      todayActivity.cards_studied += dto.cards_count ?? 0;
    }
    if (dto.type === 'quiz_completion') {
      progress.total_quizzes_completed += 1;
      todayActivity.quizzes_completed += 1;
    }

    todayActivity.xp_earned += xpGained;

    await this.progressRepo.save(progress);
    await this.dailyRepo.save(todayActivity);

    return {
      xp_gained: xpGained,
      level_up: levelUp,
      new_level: progress.level,
      new_xp: progress.xp,
      streak_count: progress.streak_count,
      streak_updated: streakUpdated,
    };
  }

  async getMyStats(userId: number): Promise<ProgressResponseDto> {
    const progress = await this.getOrCreateProgress(userId);
    const todayActivity = await this.getTodayActivity(userId);
    const bounds = getXpBounds(progress.level);
    const xpInLevel = progress.xp - bounds.current;
    const xpRange = bounds.next - bounds.current;
    const xpProgressPercent = xpRange > 0 ? Math.floor((xpInLevel / xpRange) * 100) : 100;

    return {
      xp: progress.xp,
      level: progress.level,
      streak_count: progress.streak_count,
      longest_streak: progress.longest_streak,
      total_cards_studied: progress.total_cards_studied,
      total_quizzes_completed: progress.total_quizzes_completed,
      xp_for_current_level: bounds.current,
      xp_to_next_level: bounds.next,
      xp_progress_percent: xpProgressPercent,
      today: {
        cards_studied: todayActivity.cards_studied,
        quizzes_completed: todayActivity.quizzes_completed,
        xp_earned: todayActivity.xp_earned,
      },
    };
  }

  async getWeeklyActivity(userId: number): Promise<WeeklyActivityItemDto[]> {
    const result: WeeklyActivityItemDto[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = DAY_LABELS[d.getDay()];

      const activity = await this.dailyRepo.findOne({
        where: { user_id: userId, activity_date: dateStr },
      });

      result.push({
        date: dateStr,
        day_label: dayLabel,
        xp_earned: activity?.xp_earned ?? 0,
        cards_studied: activity?.cards_studied ?? 0,
        quizzes_completed: activity?.quizzes_completed ?? 0,
      });
    }
    return result;
  }

  async getLeaderboard(): Promise<LeaderboardItemDto[]> {
    const topProgress = await this.progressRepo.find({
      order: { xp: 'DESC' },
      take: 10,
    });

    const result: LeaderboardItemDto[] = [];
    for (let i = 0; i < topProgress.length; i++) {
      const p = topProgress[i];
      const user = await this.userRepo.findOne({ where: { id: p.user_id } });
      const email = user?.email ?? 'Unknown';
      const displayName = email.split('@')[0];

      result.push({
        rank: i + 1,
        user_id: p.user_id,
        email,
        display_name: displayName,
        xp: p.xp,
        level: p.level,
        streak_count: p.streak_count,
      });
    }
    return result;
  }
}
