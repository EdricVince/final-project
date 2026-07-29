import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';

@Entity('live_sessions')
export class LiveSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teacher_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  teacher?: User;

  @Column({ nullable: true, type: 'int' })
  class_id: number | null;

  @ManyToOne(() => Class, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'class_id' })
  classRef?: Class | null;

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
