import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('daily_activities')
export class DailyActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'varchar' })
  activity_date: string;

  @Column({ default: 0 })
  xp_earned: number;

  @Column({ default: 0 })
  cards_studied: number;

  @Column({ default: 0 })
  quizzes_completed: number;

  @CreateDateColumn()
  created_at: Date;
}
