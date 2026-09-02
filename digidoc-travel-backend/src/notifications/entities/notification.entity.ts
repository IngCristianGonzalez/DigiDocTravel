import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ length: 50, nullable: true })
  referenceType: string;

  @Column({ type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ default: false })
  read: boolean;

  @Column({ default: false })
  emailSent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
