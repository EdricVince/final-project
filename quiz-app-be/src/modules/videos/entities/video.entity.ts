import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teacher_id: number;

  @Column({ nullable: true, type: 'int' })
  class_id: number | null;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text' })
  video_url: string;

  @Column({ nullable: true, type: 'text' })
  lesson_name: string | null;

  @Column({ default: 0 })
  duration: number;

  @Column({ default: true })
  is_published: boolean;

  @CreateDateColumn()
  created_at: Date;
}
