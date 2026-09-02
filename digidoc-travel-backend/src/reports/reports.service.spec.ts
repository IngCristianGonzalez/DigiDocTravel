import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportsService } from './reports.service.js';
import { Student } from '../students/entities/student.entity.js';
import { Document } from '../documents/entities/document.entity.js';
import { Visa } from '../visas/entities/visa.entity.js';
import { Installment } from '../payments/entities/installment.entity.js';

const mockRepo = (data: any[] = []) => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(data),
  }),
  count: jest.fn(),
});

describe('ReportsService - RF-046 a RF-050', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Student), useFactory: () => mockRepo([{ id: '1' }]) },
        { provide: getRepositoryToken(Document), useFactory: () => mockRepo([{ id: '1' }]) },
        { provide: getRepositoryToken(Visa), useFactory: () => mockRepo([{ id: '1' }]) },
        { provide: getRepositoryToken(Installment), useFactory: () => mockRepo([{ id: '1', amount: '1000' }]) },
      ],
    }).compile();
    service = module.get<ReportsService>(ReportsService);
  });

  it('RF-046 Reporte estudiantes', async () => {
    const res = await service.studentsReport({});
    expect(res.total).toBe(1);
    expect(res.generatedAt).toBeDefined();
  });

  it('RF-047 Reporte documentos', async () => {
    const res = await service.documentsReport({});
    expect(res.total).toBe(1);
  });

  it('RF-048 Reporte visas por vencer', async () => {
    const res = await service.visasReport({ expiring: 'true' });
    expect(res.total).toBe(1);
  });

  it('RF-049 Reporte pagos pendientes', async () => {
    const res = await service.paymentsReport({ status: 'pending' });
    expect(res.total).toBe(1);
    expect(res.totalAmount).toBeGreaterThan(0);
  });

  it('RF-050 Exportar PDF', async () => {
    const res = await service.exportReport('students', 'pdf', {});
    expect(res.contentType).toBe('application/pdf');
    expect(res.filename).toContain('.pdf');
  });

  it('RF-050 Exportar Excel', async () => {
    const res = await service.exportReport('payments', 'excel', {});
    expect(res.contentType).toContain('spreadsheet');
    expect(res.filename).toContain('.xlsx');
  });
});
