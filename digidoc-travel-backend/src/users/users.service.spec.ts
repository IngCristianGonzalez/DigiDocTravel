import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';
import { Role } from '../roles/entities/role.entity.js';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

const mockUserRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
  update: jest.fn(),
});

const mockRoleRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findBy: jest.fn(),
});

describe('UsersService - RF-007 a RF-011', () => {
  let service: UsersService;
  let userRepo: any;
  let roleRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
        { provide: getRepositoryToken(Role), useFactory: mockRoleRepo },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    roleRepo = module.get(getRepositoryToken(Role));
  });

  describe('RF-007 Registrar usuarios', () => {
    it('debe crear usuario con email único', async () => {
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockReturnValue({ email: 'test@test.com', password: 'hashed' });
      userRepo.save.mockResolvedValue({ id: '1', email: 'test@test.com' });
      roleRepo.find.mockResolvedValue([]);
      const result = await service.create({ email: 'test@test.com', password: 'Password123' } as any);
      expect(result.email).toBe('test@test.com');
    });
    it('debe lanzar 409 si email duplicado', async () => {
      userRepo.findOne.mockResolvedValue({ id: '1', email: 'test@test.com' });
      await expect(service.create({ email: 'test@test.com', password: 'Password123' } as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('RF-009 Desactivar usuarios', () => {
    it('debe desactivar usuario activo', async () => {
      const user = { id: '1', email: 'a@a.com', status: true, roles: [] };
      userRepo.findOne.mockResolvedValue(user);
      roleRepo.findOne.mockResolvedValue(null);
      userRepo.save.mockResolvedValue({ ...user, status: false });
      const res = await service.deactivate('1');
      expect(res.status).toBe(false);
    });
    it('no debe desactivar último admin', async () => {
      const adminUser = { id: '1', status: true, roles: [{ name: 'admin' }] };
      userRepo.findOne.mockResolvedValue(adminUser);
      roleRepo.findOne.mockResolvedValue({ name: 'admin' });
      const qb = { innerJoin: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getCount: jest.fn().mockResolvedValue(1) };
      userRepo.createQueryBuilder.mockReturnValue(qb);
      // mock chain for adminCount
      qb.innerJoin = jest.fn().mockReturnValue(qb);
      await expect(service.deactivate('1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('RF-011 Asignar roles', () => {
    it('debe asignar roles correctamente', async () => {
      const user = { id: '1', roles: [] };
      userRepo.findOne.mockResolvedValue(user);
      roleRepo.find.mockResolvedValue([{ id: 'r1', name: 'admin' }]);
      userRepo.save.mockResolvedValue({ ...user, roles: [{ id: 'r1' }] });
      const res = await service.assignRoles('1', ['r1']);
      expect(res.roles).toBeDefined();
    });
    it('debe lanzar 404 si rol no existe', async () => {
      userRepo.findOne.mockResolvedValue({ id: '1', roles: [] });
      roleRepo.find.mockResolvedValue([]);
      await expect(service.assignRoles('1', ['invalid'])).rejects.toThrow(NotFoundException);
    });
  });

  describe('RF-010 Consultar usuarios', () => {
    it('debe listar usuarios con paginación', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: '1' }], 1]),
      };
      userRepo.createQueryBuilder.mockReturnValue(qb);
      const res = await service.findAll({ page: 1, limit: 10 } as any);
      expect(res.total).toBe(1);
      expect(res.data).toHaveLength(1);
    });
  });
});
