import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  GoneException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service.js';
import { AuditService } from '../audit/audit.service.js';
import { LoginDto } from './dto/login.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { logSecurityEvent } from '../security/logger/winston.logger.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async login(dto: LoginDto, ip: string, device: string) {
    // OWASP A07 - Brute force protection: check attempts by IP and email
    const attemptKey = `login_attempts:${ip}:${dto.email}`;
    const blockKey = `login_block:${ip}:${dto.email}`;
    const isBlocked = await this.cacheManager.get(blockKey);
    if (isBlocked) {
      logSecurityEvent('LOGIN_BLOCKED', { email: dto.email, ip, device });
      throw new UnauthorizedException('Too many failed attempts. Try again in 15 minutes');
    }
    const attempts = (await this.cacheManager.get<number>(attemptKey)) || 0;
    if (attempts >= 5) {
      await this.cacheManager.set(blockKey, true, 900000); // 15 min
      await this.cacheManager.del(attemptKey);
      logSecurityEvent('LOGIN_LOCKOUT', { email: dto.email, ip, attempts });
      throw new UnauthorizedException('Account locked due to too many failed attempts');
    }

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      await this.cacheManager.set(attemptKey, attempts + 1, 900000);
      logSecurityEvent('LOGIN_FAILED_USER_NOT_FOUND', { email: dto.email, ip });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.status) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      dto.password,
    );
    if (!isPasswordValid) {
      await this.cacheManager.set(attemptKey, attempts + 1, 900000);
      logSecurityEvent('LOGIN_FAILED_BAD_PASSWORD', { email: dto.email, ip, attempts: attempts + 1 });
      await this.auditService.log({ userId: user.id, action: 'LOGIN_FAILED', module: 'auth', ip, device });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Success - reset attempts
    await this.cacheManager.del(attemptKey);
    await this.cacheManager.del(blockKey);

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    await this.usersService.updateLastLogin(user.id);

    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      module: 'auth',
      ip,
      device,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles.map((r) => r.name),
      },
    };
  }

  async logout(userId: string, ip: string, device: string) {
    await this.cacheManager.del(`refresh:${userId}`);
    await this.cacheManager.del(`session:${userId}`);

    await this.auditService.log({
      userId,
      action: 'LOGOUT',
      module: 'auth',
      ip,
      device,
    });

    return { message: 'Logged out successfully' };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'digidoc-refresh-secret',
      });

      const storedToken = await this.cacheManager.get<string>(
        `refresh:${payload.sub}`,
      );
      if (storedToken !== token) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.status) {
        throw new UnauthorizedException('User not found or disabled');
      }

      const tokens = await this.generateTokens(user);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = randomUUID();
    await this.cacheManager.set(`reset:${resetToken}`, user.id, 3600000);

    // In production, publish Kafka event for notification service
    // await this.kafkaClient.emit('auth.password.reset', {
    //   userId: user.id,
    //   email: user.email,
    //   token: resetToken,
    // });

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.cacheManager.get<string>(`reset:${token}`);
    if (!userId) {
      throw new GoneException('Invalid or expired reset token');
    }

    await this.usersService.updatePassword(userId, newPassword);
    await this.cacheManager.del(`reset:${token}`);

    // Invalidate all sessions
    await this.cacheManager.del(`refresh:${userId}`);
    await this.cacheManager.del(`session:${userId}`);

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentValid = await this.usersService.validatePassword(
      user,
      dto.currentPassword,
    );
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    await this.usersService.updatePassword(userId, dto.newPassword);

    // Invalidate other sessions
    await this.cacheManager.del(`refresh:${userId}`);

    return { message: 'Password changed successfully' };
  }

  async register(dto: RegisterDto) {
    const firstName = dto.firstName || dto.fullName?.split(' ')[0] || 'User';
    const lastName = dto.lastName || dto.fullName?.split(' ').slice(1).join(' ') || '';
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      firstName,
      lastName,
    } as any);
    return { id: user.id, email: user.email, message: 'User registered successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: (user as any).firstName,
      lastName: (user as any).lastName,
      roles: user.roles.map((r) => ({
        id: r.id,
        name: r.name,
        permissions: r.permissions.map((p) => ({
          module: p.module,
          action: p.action,
        })),
      })),
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }

  private async generateTokens(user: any) {
    // OWASP A02 - Strong JWT: issuer, audience, short-lived, jti for rotation
    const jti = randomUUID();
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r: any) => r.name),
      jti,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        issuer: 'digidoc.travel',
        audience: 'digidoc-frontend',
        jwtid: jti,
      }),
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'digidoc-refresh-secret',
        expiresIn: '7d',
        issuer: 'digidoc.travel',
        audience: 'digidoc-frontend',
        jwtid: jti,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    await this.cacheManager.set(`refresh:${userId}`, token, 604800000); // 7 days
  }
}
