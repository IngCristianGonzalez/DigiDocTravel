import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service.js';
import { PaymentPlan } from './entities/payment-plan.entity.js';
import { Installment } from './entities/installment.entity.js';
import { Payment } from './entities/payment.entity.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('PaymentsService', () => {
  let service: PaymentsService;
  let planRepo: any;
  let instRepo: any;
  let payRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(PaymentPlan), useFactory: mockRepo },
        { provide: getRepositoryToken(Installment), useFactory: mockRepo },
        { provide: getRepositoryToken(Payment), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<PaymentsService>(PaymentsService);
    planRepo = module.get(getRepositoryToken(PaymentPlan));
    instRepo = module.get(getRepositoryToken(Installment));
    payRepo = module.get(getRepositoryToken(Payment));
  });

  it('Crear plan genera cuotas', async () => {
    planRepo.create.mockReturnValue({ id: 'p1' });
    planRepo.save.mockResolvedValue({ id: 'p1' });
    instRepo.create.mockImplementation((v: any) => v);
    instRepo.save.mockResolvedValue([]);
    planRepo.findOne.mockResolvedValue({ id: 'p1', installmentsList: [] });
    const res = await service.createPlan({ studentId: 's1', concept: 'Matricula', totalAmount: 3000, installments: 3, startDate: '2024-01-01' } as any, 'u1');
    expect(instRepo.save).toHaveBeenCalled();
    const savedInstallments = instRepo.save.mock.calls[0][0];
    expect(savedInstallments).toHaveLength(3);
    expect(savedInstallments[0].amount).toBe(1000);
  });

  it('Registrar pago', async () => {
    instRepo.findOne.mockResolvedValue({ id: 'i1', status: 'pending', planId: 'p1' });
    payRepo.create.mockReturnValue({ id: 'pay1' });
    payRepo.save.mockResolvedValue({ id: 'pay1' });
    instRepo.save.mockResolvedValue({});
    instRepo.find.mockResolvedValue([{ status: 'paid' }]);
    planRepo.update.mockResolvedValue({});
    const res = await service.registerPayment('i1', { amount: 1000, paymentDate: '2024-02-01', method: 'transfer' } as any, 'u1');
    expect(res.id).toBe('pay1');
  });

  it('No pagar cuota ya pagada', async () => {
    instRepo.findOne.mockResolvedValue({ id: 'i1', status: 'paid' });
    await expect(service.registerPayment('i1', { amount: 100 } as any, 'u1')).rejects.toThrow(BadRequestException);
  });

  it('Consultar estado plan', async () => {
    planRepo.findOne.mockResolvedValue({ id: 'p1', installmentsList: [{ id: 'i1' }] });
    const res = await service.findOne('p1');
    expect(res.id).toBe('p1');
  });

  it('Pendientes dashboard', async () => {
    const qb = { leftJoinAndSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([{ id: 'i1' }]) };
    instRepo.createQueryBuilder.mockReturnValue(qb);
    const res = await service.findPending();
    expect(res).toHaveLength(1);
  });
});
