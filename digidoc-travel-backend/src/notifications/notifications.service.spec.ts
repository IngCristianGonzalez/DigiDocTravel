import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service.js';
import { Notification } from './entities/notification.entity.js';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('NotificationsService - RF-042 a RF-045', () => {
  let service: NotificationsService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: getRepositoryToken(Notification), useFactory: mockRepo }],
    }).compile();
    service = module.get<NotificationsService>(NotificationsService);
    repo = module.get(getRepositoryToken(Notification));
  });

  it('RF-042 Crear notificación in-app', async () => {
    repo.create.mockReturnValue({ id: '1', title: 'Test' });
    repo.save.mockResolvedValue({ id: '1', title: 'Test' });
    const res = await service.create({ userId: 'u1', type: 'visa', title: 'Visa por vencer', message: 'Tu visa vence en 30 días' } as any);
    expect(res.title).toBe('Test');
  });

  it('RF-043 Email flag', async () => {
    repo.create.mockReturnValue({ emailSent: false });
    repo.save.mockResolvedValue({ id: '1', emailSent: false });
    const res = await service.create({ userId: 'u1', type: 'payment', title: 'Pago pendiente', message: 'Cuota vence pronto' } as any);
    expect(res).toBeDefined();
  });

  it('RF-044 Marcar como leída', async () => {
    repo.findOne.mockResolvedValue({ id: '1', userId: 'u1', read: false });
    repo.save.mockResolvedValue({ id: '1', read: true });
    const res = await service.markAsRead('1', 'u1');
    expect(res.read).toBe(true);
  });

  it('RF-045 Historial con paginación', async () => {
    const qb = { where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), take: jest.fn().mockReturnThis(), getManyAndCount: jest.fn().mockResolvedValue([[{ id: '1' }], 1]) };
    repo.createQueryBuilder.mockReturnValue(qb);
    const res = await service.findAll('u1', { page: 1, limit: 10 });
    expect(res.total).toBe(1);
  });

  it('RF-044 Contar no leídas', async () => {
    repo.count.mockResolvedValue(5);
    const res = await service.countUnread('u1');
    expect(res.count).toBe(5);
  });
});
