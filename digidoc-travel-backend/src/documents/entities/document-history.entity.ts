import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Document } from './document.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('document_history')
export class DocumentHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  documentId: string;

  @ManyToOne(() => Document, d => d.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 50 })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  changes: any;

  @CreateDateColumn()
  createdAt: Date;
}
