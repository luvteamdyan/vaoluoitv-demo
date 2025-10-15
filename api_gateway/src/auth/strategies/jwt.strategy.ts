import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '@/auth/auth.service';
import { AppConfigService } from '@/config/app-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: AppConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: any) {
    // Check if payload.sub is a valid MongoDB ObjectId (24 hex chars) or UUID
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(payload.sub);
    const isUUID =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        payload.sub,
      );

    let user;

    if (isObjectId) {
      // payload.sub is MongoDB ObjectId, find by _id
      user = await this.authService.findById(String(payload.sub));
    } else if (isUUID) {
      // payload.sub is UUID (external_id), find by external_id
      user = await this.authService.findByExternalId(String(payload.sub));
    } else {
      // Invalid format, try both methods
      user =
        (await this.authService.findById(String(payload.sub))) ||
        (await this.authService.findByExternalId(String(payload.sub)));
    }

    if (!user) {
      return null;
    }

    // Validate external_id consistency if present in both payload and user
    if (
      payload.external_id &&
      user.external_id &&
      payload.external_id !== user.external_id
    ) {
      // external_id might have been updated
    }

    return {
      id: user._id,
      email: user.email,
      name: user.username,
      role: user.role,
      external_id: user.external_id,
    };
  }
}
