import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentPlan } from './entities/payment-plan.entity.js';
import { Installment } from './entities/installment.entity.js';
import { Payment } from './entities/payment.entity.js';
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentPlan) private readonly planRepo: Repository<PaymentPlan>,
    @InjectRepository(Installment) private readonly instRepo: Repository<Installment>,
    @InjectRepository(Payment) private readonly payRepo: Repository<Payment>,
  ) {}

  async createPlan(dto: CreatePlanDto, userId: string): Promise<PaymentPlan> {
    const plan = this.planRepo.create({ ...dto, createdBy: userId } as any) as unknown as PaymentPlan;
    const saved = await this.planRepo.save(plan as any) as unknown as PaymentPlan;
    const amountPer = parseFloat((dto.totalAmount / dto.installments).toFixed(2));
    const installments: Installment[] = [];
    const start = new Date(dto.startDate);
    for (let i = 0; i < dto.installments; i++) {
      const due = new Date(start);
      due.setMonth(due.getMonth() + i);
      installments.push(this.instRepo.create({
        planId: saved.id,
        number: i + 1,
        amount: amountPer,
        dueDate: due.toISOString().split('T')[0],
        status: 'pending',
      } as any) as unknown as Installment);
    }
    // adjust last installment for rounding
    const totalGenerated = amountPer * dto.installments;
    const diff = parseFloat((dto.totalAmount - totalGenerated).toFixed(2));
    if (diff !== 0 && installments.length > 0) installments[installments.length - 1].amount = parseFloat((amountPer + diff).toFixed(2));
    await this.instRepo.save(installments);
    return this.findOne((saved as any).id);
  }

  async findAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const qb = this.planRepo.createQueryBuilder('plan').leftJoinAndSelect('plan.student', 'student').leftJoinAndSelect('plan.installmentsList', 'inst');
    if (query.studentId) qb.andWhere('plan.studentId = :sid', { sid: query.studentId });
    if (query.status) qb.andWhere('plan.status = :status', { status: query.status });
    qb.orderBy('plan.createdAt', 'DESC');
    qb.skip((page-1)*limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total/limit) };
  }

  async findOne(id: string): Promise<PaymentPlan> {
    const plan = await this.planRepo.findOne({ where: { id }, relations: { student: true, installmentsList: { payments: true } } as any });
    if (!plan) throw new NotFoundException('Payment plan not found');
    return plan;
  }

  async getInstallments(planId: string) {
    await this.findOne(planId);
    return this.instRepo.find({ where: { planId }, order: { number: 'ASC' }, relations: { payments: true } as any });
  }

  async registerPayment(installmentId: string, dto: CreatePaymentDto, userId: string): Promise<Payment> {
    const inst = await this.instRepo.findOne({ where: { id: installmentId } });
    if (!inst) throw new NotFoundException('Installment not found');
    if (inst.status === 'paid') throw new BadRequestException('Installment already paid');
    const payment = this.payRepo.create({ installmentId, amount: dto.amount, paymentDate: dto.paymentDate, method: dto.method, reference: dto.reference, receiptUrl: dto.receiptUrl, createdBy: userId } as any);
    const saved = await this.payRepo.save(payment as any) as unknown as Payment;
    inst.status = 'paid';
    inst.paidAt = new Date();
    await this.instRepo.save(inst);
    // update plan status if all paid
    const all = await this.instRepo.find({ where: { planId: inst.planId } });
    if (all.every(i => i.status === 'paid')) {
      await this.planRepo.update(inst.planId, { status: 'completed' } as any);
    }
    return saved;
  }

  async findPending() {
    const now = new Date();
    const in7days = new Date();
    in7days.setDate(now.getDate() + 30);
    const pending = await this.instRepo.createQueryBuilder('inst')
      .leftJoinAndSelect('inst.plan', 'plan')
      .leftJoinAndSelect('plan.student', 'student')
      .where('inst.status = :status', { status: 'pending' })
      .andWhere('inst.dueDate <= :threshold', { threshold: in7days.toISOString().split('T')[0] })
      .orderBy('inst.dueDate', 'ASC')
      .getMany();
    return pending;
  }
}
