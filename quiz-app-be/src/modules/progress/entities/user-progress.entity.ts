import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_id: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  streak_count: number;

  @Column({ default: 0 })
  longest_streak: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  last_activity_date: string | null;

  @Column({ default: 0 })
  total_cards_studied: number;

  @Column({ default: 0 })
  total_quizzes_completed: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
