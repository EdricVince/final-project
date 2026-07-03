import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('live_sessions')
export class LiveSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teacher_id: number;

  @Column({ nullable: true, type: 'int' })
  class_id: number | null;

  @Column()
  title: string;

  @Column({ unique: true, length: 8 })
  pin: string;

  @Column({ type: 'text', nullable: true })
  questions: string | null; // JSON array

  @Column({ default: 'waiting' })
  status: string; // waiting | active | finished

  @Column({ default: 0 })
  current_question: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
