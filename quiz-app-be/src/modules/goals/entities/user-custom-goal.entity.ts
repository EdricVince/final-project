import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('user_custom_goals')
export class UserCustomGoal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  description: string | null;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  created_at: Date;
}
