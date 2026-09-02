import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service.js';
import { Student } from '../students/entities/student.entity.js';
import { Document } from '../documents/entities/document.entity.js';
import { Visa } from '../visas/entities/visa.entity.js';
import { Installment } from '../payments/entities/installment.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { User } from '../users/entities/user.entity.js';

const mockRepo = () => ({
  count: jest.fn().mockResolvedValue(5),
  find: jest.fn().mockResolvedValue([]),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(2),
    getRawOne: jest.fn().mockResolvedValue({ sum: '5000' }),
    getRawMany: jest.fn().mockResolvedValue([{ country: 'Colombia', count: '5' }]),
    getMany: jest.fn().mockResolvedValue([]),
  }),
});

describe('DashboardService - RF-051 a RF-056', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Student), useFactory: mockRepo },
        { provide: getRepositoryToken(Document), useFactory: mockRepo },
        { provide: getRepositoryToken(Visa), useFactory: mockRepo },
        { provide: getRepositoryToken(Installment), useFactory: mockRepo },
        { provide: getRepositoryToken(Event), useFactory: mockRepo },
        { provide: getRepositoryToken(User), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<DashboardService>(DashboardService);
  });

  it('RF-051 Resumen general', async () => {
    const res = await service.getSummary();
    expect(res.students.total).toBe(5);
    expect(res.visas.expiringIn90Days).toBeDefined();
    expect(res.payments.pending).toBeDefined();
    expect(res.events.next7Days).toBeDefined();
  });

  it('RF-052 Estudiantes activos', async () => {
    const res = await service.getStudentsStats();
    expect(res.total).toBe(5);
    expect(res.byCountry).toBeDefined();
  });

  it('RF-053 Documentos pendientes', async () => {
    const res = await service.getPendingDocuments();
    expect(res).toBeDefined();
  });

  it('RF-054 Visas por vencer', async () => {
    const res = await service.getExpiringVisas();
    expect(res).toBeDefined();
  });

  it('RF-055 Pagos pendientes', async () => {
    const res = await service.getPendingPayments();
    expect(res).toBeDefined();
  });

  it('RF-056 Próximos eventos', async () => {
    const res = await service.getUpcomingEvents();
    expect(res).toBeDefined();
  });
});
