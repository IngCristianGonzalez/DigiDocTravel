import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'digidoc-secret-key',
      issuer: configService.get<string>('JWT_ISSUER') || 'digidoc.travel',
      audience: 'digidoc-frontend',
      algorithms: ['HS256'], // OWASP A02 - explicit algorithm, prevent none
    });
  }

  async validate(payload: { sub: string; email: string; roles: string[] }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.status) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }
}
