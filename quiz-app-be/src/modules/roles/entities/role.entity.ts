import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}

// Role constants
export const ROLE_STUDENT = 1;
export const ROLE_TEACHER = 2;
export const ROLE_ADMIN = 3;

export const ROLE_NAMES = {
  [ROLE_STUDENT]: 'STUDENT',
  [ROLE_TEACHER]: 'TEACHER',
  [ROLE_ADMIN]: 'ADMIN',
} as const;
