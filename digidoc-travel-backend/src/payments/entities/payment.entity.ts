import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Installment } from './installment.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  installmentId: string;

  @ManyToOne(() => Installment, i => i.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'installment_id' })
  installment: Installment;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  paymentDate: string;

  @Column({ length: 50, nullable: true })
  method: string;

  @Column({ length: 255, nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  receiptUrl: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
}
