import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { EventParticipant } from './event-participant.entity.js';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  eventDate: Date;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  qrCode: string;

  @Column({ length: 255, unique: true })
  uniqueLink: string;

  @Column({ default: false })
  reminderSent: boolean;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => EventParticipant, p => p.event, { cascade: true })
  participants: EventParticipant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
