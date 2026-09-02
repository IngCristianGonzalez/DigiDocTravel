import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsService } from './events.service.js';
import { Event } from './entities/event.entity.js';
import { EventParticipant } from './entities/event-participant.entity.js';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('EventsService - RF-037 a RF-041', () => {
  let service: EventsService;
  let eventRepo: any;
  let partRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService, { provide: getRepositoryToken(Event), useFactory: mockRepo }, { provide: getRepositoryToken(EventParticipant), useFactory: mockRepo }],
    }).compile();
    service = module.get<EventsService>(EventsService);
    eventRepo = module.get(getRepositoryToken(Event));
    partRepo = module.get(getRepositoryToken(EventParticipant));
  });

  it('RF-037 Crear evento con QR y link', async () => {
    eventRepo.create.mockReturnValue({ id: 'e1', title: 'Orientation' });
    eventRepo.save.mockResolvedValue({ id: 'e1' });
    eventRepo.findOne.mockResolvedValue({ id: 'e1', title: 'Orientation', qrCode: 'data:image/png', uniqueLink: 'abc-123' });
    partRepo.create.mockReturnValue({});
    partRepo.save.mockResolvedValue([]);
    const res = await service.create({ title: 'Orientation', eventDate: '2024-12-01T10:00:00Z', location: 'Auditorio' } as any, 'u1');
    expect(res.qrCode).toContain('data:image');
    expect(res.uniqueLink).toBeDefined();
  });

  it('RF-039 Generar QR', async () => {
    eventRepo.findOne.mockResolvedValue({ id: 'e1', qrCode: 'data:image/png;base64,abc', uniqueLink: 'link123' });
    const res = await service.getQr('e1');
    expect(res.qrCode).toContain('data:image');
  });

  it('RF-040 Link único', async () => {
    eventRepo.findOne.mockResolvedValue({ id: 'e1', uniqueLink: 'link123' });
    const res = await service.findByLink('link123');
    expect(res.uniqueLink).toBe('link123');
  });

  it('RF-038 Editar evento', async () => {
    eventRepo.findOne.mockResolvedValue({ id: 'e1', title: 'Old' });
    eventRepo.save.mockResolvedValue({ id: 'e1', title: 'New' });
    const res = await service.update('e1', { title: 'New' } as any);
    expect(res.title).toBe('New');
  });
});
