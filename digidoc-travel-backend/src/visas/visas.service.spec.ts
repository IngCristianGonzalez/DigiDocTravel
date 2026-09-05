import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VisasService } from './visas.service.js';
import { Visa } from './entities/visa.entity.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('VisasService', () => {
  let service: VisasService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisasService, { provide: getRepositoryToken(Visa), useFactory: mockRepo }],
    }).compile();
    service = module.get<VisasService>(VisasService);
    repo = module.get(getRepositoryToken(Visa));
  });

  it('Registrar visa válida', async () => {
    repo.create.mockReturnValue({});
    repo.save.mockResolvedValue({ id: '1', issueDate: '2024-01-01', expiryDate: '2025-01-01' });
    const res = await service.create({ studentId: 's1', visaType: 'student', country: 'USA', issueDate: '2024-01-01', expiryDate: '2025-01-01' } as any, 'u1');
    expect(res.id).toBe('1');
  });

  it('Validar fecha vencimiento < expedición debe fallar', async () => {
    await expect(service.create({ studentId: 's1', visaType: 't', country: 'USA', issueDate: '2025-01-01', expiryDate: '2024-01-01' } as any, 'u1')).rejects.toThrow(BadRequestException);
  });

  it('Consultar estado - calcular días restantes', async () => {
    const future = new Date(); future.setDate(future.getDate()+30);
    repo.findOne.mockResolvedValue({ id: '1', expiryDate: future.toISOString().split('T')[0] });
    const res = await service.findOne('1');
    expect(res.computedStatus).toBe('expiring_soon');
    expect(res.daysLeft).toBeGreaterThan(0);
  });

  it('Expiring en 90 días', async () => {
    const qb = { leftJoinAndSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([{ id:'1', expiryDate: new Date().toISOString().split('T')[0]}]) };
    repo.createQueryBuilder.mockReturnValue(qb);
    const res = await service.findExpiring(90);
    expect(res.length).toBe(1);
  });

  it('Alerta automática debe marcar alertSent', async () => {
    const visa = { id: '1', expiryDate: new Date().toISOString().split('T')[0], alertSent: false };
    const qb = { leftJoinAndSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([visa]) };
    repo.createQueryBuilder.mockReturnValue(qb);
    repo.save.mockResolvedValue({ ...visa, alertSent: true });
    const res = await service.checkExpiringAndAlert();
    expect(repo.save).toHaveBeenCalled();
  });
});
