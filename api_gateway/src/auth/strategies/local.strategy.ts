import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Vẫn sử dụng email field nhưng có thể chứa username
  }

  async validate(email: string, password: string): Promise<any> {
    // email field có thể chứa cả email hoặc username
    const user = await this.authService.validateUserWithWebhook(
      email,
      password,
    );
    if (!user) {
      throw new UnauthorizedException('Mật khẩu hoặc email không đúng');
    }
    return user;
  }
}
