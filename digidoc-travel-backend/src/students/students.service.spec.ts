import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StudentsService } from './students.service.js';
import { Student } from './entities/student.entity.js';
import { StudentObservation } from './entities/student-observation.entity.js';
import { ConflictException, NotFoundException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { User } from '../users/entities/user.entity.js';

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('StudentsService', () => {
  let service: StudentsService;
  let studentRepo: any;
  let obsRepo: any;
  let userRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(Student), useFactory: mockRepo },
        { provide: getRepositoryToken(StudentObservation), useFactory: mockRepo },
        { provide: getRepositoryToken(User), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<StudentsService>(StudentsService);
    studentRepo = module.get(getRepositoryToken(Student));
    obsRepo = module.get(getRepositoryToken(StudentObservation));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('Registrar estudiantes', async () => {
    studentRepo.findOne.mockResolvedValue(null);
    studentRepo.create.mockReturnValue({ email: 's@test.com' });
    studentRepo.save.mockResolvedValue({ id: '1', email: 's@test.com' });
    const res = await service.create({ firstName: 'Juan', lastName: 'Perez', email: 's@test.com', countryOrigin: 'Colombia' } as any);
    expect(res.email).toBe('s@test.com');
  });

  it('debe fallar si email duplicado', async () => {
    studentRepo.findOne.mockResolvedValue({ id: '1' });
    await expect(service.create({ email: 'dup@test.com' } as any)).rejects.toThrow(ConflictException);
  });

  it('debe fallar si identificación duplicada', async () => {
    studentRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: '1', identification: '123456' });
    await expect(
      service.create({ email: 'nuevo@test.com', identification: '123456' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('Consultar estudiante', async () => {
    studentRepo.findOne.mockResolvedValue({ id: '1', email: 'a@a.com' });
    const res = await service.findOne('1');
    expect(res.id).toBe('1');
  });

  it('debe lanzar 404 si no existe', async () => {
    studentRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('Asociar asesor', async () => {
    const advId = '550e8400-e29b-41d4-a716-446655440000';
    const student = { id: '1', advisorId: null };
    const advisor = { id: advId, status: true, roles: [{ name: 'asesor' }] };
    userRepo.findOne.mockResolvedValue(advisor);
    studentRepo.findOne.mockResolvedValue(student);
    studentRepo.save.mockResolvedValue({ ...student, advisorId: advId });
    const res = await service.assignAdvisor('1', advId);
    expect(res.advisorId).toBe(advId);
  });

  it('debe fallar si advisorId no es UUID (400)', async () => {
    await expect(service.assignAdvisor('1', 'no-uuid')).rejects.toThrow(BadRequestException);
  });

  it('debe fallar si asesor no existe (404)', async () => {
    const advId = '550e8400-e29b-41d4-a716-446655440001';
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.assignAdvisor('1', advId)).rejects.toThrow(NotFoundException);
  });

  it('debe fallar si usuario sin rol elegible (422)', async () => {
    const advId = '550e8400-e29b-41d4-a716-446655440002';
    userRepo.findOne.mockResolvedValue({ id: advId, status: true, roles: [{ name: 'admin' }] });
    await expect(service.assignAdvisor('1', advId)).rejects.toThrow(UnprocessableEntityException);
  });

  it('debe fallar si asesor desactivado (422)', async () => {
    const advId = '550e8400-e29b-41d4-a716-446655440003';
    userRepo.findOne.mockResolvedValue({ id: advId, status: false, roles: [{ name: 'asesor' }] });
    await expect(service.assignAdvisor('1', advId)).rejects.toThrow(UnprocessableEntityException);
  });

  it('debe listar elegibles por rol asesor/consultor', async () => {
    const getMany = jest.fn().mockResolvedValue([{ id: '1', firstName: 'Ana', lastName: 'Lopez', email: 'ana@test.com', roles: [{ name: 'asesor' }] }]);
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany,
    };
    userRepo.createQueryBuilder.mockReturnValue(qb);
    const res = await service.getEligibleAdvisors();
    expect(res).toHaveLength(1);
    expect(qb.andWhere).toHaveBeenCalled();
  });

  it('Registrar observación', async () => {
    studentRepo.findOne.mockResolvedValue({ id: '1' });
    obsRepo.create.mockReturnValue({ id: 'o1', observation: 'test' });
    obsRepo.save.mockResolvedValue({ id: 'o1', observation: 'test' });
    const res = await service.addObservation('1', 'user1', 'Observación importante');
    expect(res.observation).toBe('test');
  });

  it('Consultar observaciones', async () => {
    studentRepo.findOne.mockResolvedValue({ id: '1' });
    obsRepo.find.mockResolvedValue([{ id: 'o1' }]);
    const res = await service.getObservations('1');
    expect(res).toHaveLength(1);
  });

  it('Listar solo activos por defecto', async () => {
    const andWhere = jest.fn().mockReturnThis();
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere, orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(), take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    studentRepo.createQueryBuilder.mockReturnValue(qb);
    await service.findAll({});
    const conds = andWhere.mock.calls.map((c: any[]) => String(c[0]));
    expect(conds.some((c: string) => c.includes('student.status'))).toBe(true);
  });

  it('Listar asociados por advisorId', async () => {
    const andWhere = jest.fn().mockReturnThis();
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere, orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(), take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    studentRepo.createQueryBuilder.mockReturnValue(qb);
    await service.findAll({ advisorId: 'adv-1' });
    const conds = andWhere.mock.calls.map((c: any[]) => String(c[0]));
    expect(conds.some((c: string) => c.includes('student.advisorId'))).toBe(true);
  });
});
