import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StudentsService } from './students.service.js';
import { Student } from './entities/student.entity.js';
import { StudentObservation } from './entities/student-observation.entity.js';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('StudentsService - RF-012 a RF-016', () => {
  let service: StudentsService;
  let studentRepo: any;
  let obsRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(Student), useFactory: mockRepo },
        { provide: getRepositoryToken(StudentObservation), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<StudentsService>(StudentsService);
    studentRepo = module.get(getRepositoryToken(Student));
    obsRepo = module.get(getRepositoryToken(StudentObservation));
  });

  it('RF-012 Registrar estudiantes', async () => {
    studentRepo.findOne.mockResolvedValue(null);
    studentRepo.create.mockReturnValue({ email: 's@test.com' });
    studentRepo.save.mockResolvedValue({ id: '1', email: 's@test.com' });
    const res = await service.create({ firstName: 'Juan', lastName: 'Perez', email: 's@test.com', countryOrigin: 'Colombia' } as any);
    expect(res.email).toBe('s@test.com');
  });

  it('RF-012 debe fallar si email duplicado', async () => {
    studentRepo.findOne.mockResolvedValue({ id: '1' });
    await expect(service.create({ email: 'dup@test.com' } as any)).rejects.toThrow(ConflictException);
  });

  it('RF-012 debe fallar si identificación duplicada', async () => {
    studentRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: '1', identification: '123456' });
    await expect(
      service.create({ email: 'nuevo@test.com', identification: '123456' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('RF-014 Consultar estudiante', async () => {
    studentRepo.findOne.mockResolvedValue({ id: '1', email: 'a@a.com' });
    const res = await service.findOne('1');
    expect(res.id).toBe('1');
  });

  it('RF-014 debe lanzar 404 si no existe', async () => {
    studentRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
  });

  it('RF-015 Asociar asesor', async () => {
    const student = { id: '1', advisorId: null };
    studentRepo.findOne.mockResolvedValue(student);
    studentRepo.save.mockResolvedValue({ ...student, advisorId: 'adv1' });
    const res = await service.assignAdvisor('1', 'adv1');
    expect(res.advisorId).toBe('adv1');
  });

  it('RF-016 Registrar observación', async () => {
    studentRepo.findOne.mockResolvedValue({ id: '1' });
    obsRepo.create.mockReturnValue({ id: 'o1', observation: 'test' });
    obsRepo.save.mockResolvedValue({ id: 'o1', observation: 'test' });
    const res = await service.addObservation('1', 'user1', 'Observación importante');
    expect(res.observation).toBe('test');
  });

  it('RF-016 Consultar observaciones', async () => {
    studentRepo.findOne.mockResolvedValue({ id: '1' });
    obsRepo.find.mockResolvedValue([{ id: 'o1' }]);
    const res = await service.getObservations('1');
    expect(res).toHaveLength(1);
  });
});
