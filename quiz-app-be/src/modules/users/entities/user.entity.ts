import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 1 })
  role_id: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  name: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  avatar: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
