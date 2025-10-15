import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, AuthResponseDto } from './dto/auth.dto';
import { LoggerUtil } from '../utils/logger.util';
import { AuthResponse, JwtPayload, JwtUser } from '../types/auth.types';

@Injectable()
export class AuthService {
  private logger = new LoggerUtil();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const authUrl = this.configService.get<string>('NEXT_PUBLIC_API_URL');
      this.logger.log('[AUTH] Auth URL from config:', authUrl);
      this.logger.log('[AUTH] Attempting login to:', `${authUrl}/auth/login`);
      this.logger.log('[AUTH] Login payload:', JSON.stringify(loginDto));

      // Gọi API từ auth service
      const response = await fetch(`${authUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginDto),
      });

      this.logger.log('[AUTH] Response status:', response.status);
      this.logger.log('[AUTH] Response ok:', response.ok);

      if (!response.ok && response.status !== 201) {
        const errorText = await response.text();
        this.logger.error('[AUTH] Login failed with status:', response.status);
        this.logger.error('[AUTH] Error response:', errorText);
        throw new UnauthorizedException('Invalid credentials');
      }

      const authData = (await response.json()) as AuthResponse;
      this.logger.log('[AUTH] Login successful, user:', authData.user?.email);
      this.logger.log('[AUTH] Auth data:', JSON.stringify(authData));

      // Tạo JWT token cho games service
      // Sử dụng external_id nếu có, fallback về id
      const userId = authData.user.external_id || authData.user.id;
      const payload = {
        sub: userId,
        email: authData.user.email,
        username: authData.user.username,
      };

      this.logger.log('[AUTH] JWT payload created:', {
        sub: userId,
        originalId: authData.user.id,
        externalId: authData.user.external_id,
        hasExternalId: !!authData.user.external_id,
      });

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: userId, // Sử dụng external_id nếu có
          email: authData.user.email,
        },
      };
    } catch (error) {
      this.logger.error('[AUTH] Authentication error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  validateUser(payload: JwtPayload): JwtUser {
    // Validate user từ JWT payload
    // Sử dụng external_id nếu có, fallback về sub
    const userId = payload.external_id || payload.sub;

    this.logger.log('[AUTH] JWT validation:', {
      sub: payload.sub,
      external_id: payload.external_id,
      usingUserId: userId,
    });

    return {
      userId: userId,
      email: payload.email,
      username: payload.username,
      external_id: payload.external_id,
      sub: payload.sub, // Thêm sub để so sánh authorization
    };
  }

  async getUserById(userId: string): Promise<any> {
    try {
      const authUrl = this.configService.get<string>('NEXT_PUBLIC_API_URL');
      this.logger.log('[AUTH] Getting user by ID:', userId);
      this.logger.log('[AUTH] API URL:', `${authUrl}/users/${userId}`);

      const response = await fetch(`${authUrl}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.logger.log('[AUTH] User response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          '[AUTH] Get user failed with status:',
          response.status,
        );
        this.logger.error('[AUTH] Error response:', errorText);
        throw new UnauthorizedException('User not found');
      }

      const userData = (await response.json()) as Record<string, unknown>;
      this.logger.log('[AUTH] User data:', JSON.stringify(userData));

      return userData;
    } catch (error) {
      this.logger.error('[AUTH] Get user error:', error);
      throw new UnauthorizedException('Failed to get user information');
    }
  }
}
