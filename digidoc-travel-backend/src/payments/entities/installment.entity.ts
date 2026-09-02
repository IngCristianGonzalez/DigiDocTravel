import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PaymentPlan } from './payment-plan.entity.js';
import { Payment } from './payment.entity.js';

@Entity('installments')
export class Installment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  planId: string;

  @ManyToOne(() => PaymentPlan, p => p.installmentsList, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: PaymentPlan;

  @Column({ type: 'int' })
  number: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @OneToMany(() => Payment, pay => pay.installment, { cascade: true })
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;
}
