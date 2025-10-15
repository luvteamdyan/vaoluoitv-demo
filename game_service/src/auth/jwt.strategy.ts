import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoggerUtil } from '../utils/logger.util';
import type { JwtUser, JwtPayload } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new LoggerUtil();

  constructor(
    private authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
    });

    this.logger.log(
      '[JwtStrategy] Initialized with JWT_SECRET from env:',
      configService.get<string>('JWT_SECRET')
        ? 'exists'
        : 'NOT FOUND, using fallback',
    );
  }

  validate(payload: JwtPayload): JwtUser {
    this.logger.log('[JwtStrategy] Validating payload:', payload);
    return this.authService.validateUser(payload);
  }
}
