import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('class_enrollments')
export class ClassEnrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  class_id: number;

  @Column()
  student_id: number;

  @CreateDateColumn()
  joined_at: Date;
}
