import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { AuditService } from '../audit/audit.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: any;
  let cache: any;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      validatePassword: jest.fn(),
      updateLastLogin: jest.fn(),
      create: jest.fn(),
      updatePassword: jest.fn(),
    };
    jwtService = { signAsync: jest.fn().mockResolvedValue('token'), verify: jest.fn() };
    cache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('secret') } },
        { provide: AuditService, useValue: { log: jest.fn() } },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('Login correcto', async () => {
    usersService.findByEmail.mockResolvedValue({ id: '1', email: 'a@a.com', status: true, roles: [{ name: 'admin' }], password: 'hash' });
    usersService.validatePassword.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('access');
    const res = await service.login({ email: 'a@a.com', password: 'Password123' } as any, '127.0.0.1', 'device');
    expect(res.accessToken).toBeDefined();
  });

  it('Login con contraseña incorrecta debe fallar', async () => {
    usersService.findByEmail.mockResolvedValue({ id: '1', status: true, roles: [], password: 'hash' });
    usersService.validatePassword.mockResolvedValue(false);
    await expect(service.login({ email: 'a@a.com', password: 'wrong' } as any, '', '')).rejects.toThrow(UnauthorizedException);
  });

  it('Registro', async () => {
    usersService.create = jest.fn().mockResolvedValue({ id: '1', email: 'new@test.com' });
    // need to override service create logic: service.register calls usersService.create
    // but we mocked create above via usersService, so just test
    const res = await service.register({ email: 'new@test.com', password: 'Password123', fullName: 'Juan Perez' } as any);
    expect(res.email).toBe('new@test.com');
  });

  it('Logout elimina cache', async () => {
    const res = await service.logout('1', '127.0.0.1', 'device');
    expect(cache.del).toHaveBeenCalledWith('refresh:1');
    expect(res.message).toContain('Logged out');
  });
});
