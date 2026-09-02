import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ValueTransformer } from 'typeorm';
import { Student } from '../../students/entities/student.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { encrypt, decrypt } from '../../security/helpers/crypto.helper.js';

// OWASP A02 - Encrypt visaNumber at rest
const EncryptedTransformer: ValueTransformer = {
  to: (value: string | null) => value ? encrypt(value) : value,
  from: (value: string | null) => value ? decrypt(value) : value,
};

@Entity('visas')
export class Visa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ length: 100 })
  visaType: string;

  @Column({ length: 255, nullable: true, transformer: EncryptedTransformer })
  visaNumber: string;

  @Column({ length: 100 })
  country: string;

  @Column({ type: 'date' })
  issueDate: string;

  @Column({ type: 'date' })
  expiryDate: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ default: false })
  alertSent: boolean;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
