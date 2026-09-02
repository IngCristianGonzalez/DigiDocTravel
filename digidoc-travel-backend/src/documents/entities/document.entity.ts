import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { DocumentHistory } from './document-history.entity.js';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ type: 'text' })
  fileUrl: string;

  @Column({ type: 'int', nullable: true })
  fileSize: number;

  @Column({ length: 10, nullable: true })
  fileType: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  uploadedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @OneToMany(() => DocumentHistory, h => h.document, { cascade: true })
  history: DocumentHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
