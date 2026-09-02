import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service.js';
import { Document } from './entities/document.entity.js';
import { DocumentHistory } from './entities/document-history.entity.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('DocumentsService - RF-017 a RF-024', () => {
  let service: DocumentsService;
  let docRepo: any;
  let histRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: getRepositoryToken(Document), useFactory: mockRepo },
        { provide: getRepositoryToken(DocumentHistory), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<DocumentsService>(DocumentsService);
    docRepo = module.get(getRepositoryToken(Document));
    histRepo = module.get(getRepositoryToken(DocumentHistory));
    histRepo.create.mockReturnValue({});
    histRepo.save.mockResolvedValue({});
  });

  it('RF-017 Registrar documento', async () => {
    docRepo.create.mockReturnValue({ id: '1', name: 'Pasaporte' });
    docRepo.save.mockResolvedValue({ id: '1', name: 'Pasaporte' });
    const res = await service.create({ studentId: 's1', type: 'passport', name: 'Pasaporte', category: 'identity' } as any, 'user1');
    expect(res.name).toBe('Pasaporte');
  });

  it('RF-018 Validar tamaño >10MB debe fallar', async () => {
    await expect(service.create({ studentId: 's1', type: 'pdf', name: 'test', fileSize: 11*1024*1024 } as any, 'u1')).rejects.toThrow(BadRequestException);
  });

  it('RF-018 Upload validar formato', async () => {
    const file = { originalname: 'test.exe', size: 1000 } as any;
    await expect(service.upload(file)).rejects.toThrow(BadRequestException);
  });

  it('RF-018 Upload PDF válido', async () => {
    const file = { originalname: 'test.pdf', size: 5000 } as any;
    const res = await service.upload(file);
    expect(res.fileType).toBe('pdf');
    expect(res.fileUrl).toContain('s3.mock');
  });

  it('RF-021 Descargar documento URL temporal', async () => {
    docRepo.findOne.mockResolvedValue({ id: '1', fileUrl: 'https://s3.mock/file.pdf' });
    const res = await service.getDownloadUrl('1');
    expect(res.url).toContain('expires');
    expect(res.expiresIn).toBe('1h');
  });

  it('RF-022 Buscar por filtros', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: '1' }], 1]),
    };
    docRepo.createQueryBuilder.mockReturnValue(qb);
    const res = await service.findAll({ page: 1, limit: 10, type: 'passport' });
    expect(res.total).toBe(1);
  });

  it('RF-024 Historial', async () => {
    docRepo.findOne.mockResolvedValue({ id: '1' });
    histRepo.find.mockResolvedValue([{ id: 'h1', action: 'CREATE' }]);
    const res = await service.getHistory('1');
    expect(res[0].action).toBe('CREATE');
  });
});
