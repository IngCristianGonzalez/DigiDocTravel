import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Installment } from './installment.entity.js';

@Entity('payment_plans')
export class PaymentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ length: 255 })
  concept: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'int' })
  installments: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => Installment, i => i.plan, { cascade: true })
  installmentsList: Installment[];

  @CreateDateColumn()
  createdAt: Date;
}
