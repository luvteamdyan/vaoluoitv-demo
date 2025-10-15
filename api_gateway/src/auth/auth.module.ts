import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from '@/auth/auth.service';
import { AuthController } from '@/auth/auth.controller';
import { RecaptchaService } from '@/auth/recaptcha.service';
import { User, UserSchema } from '@/schemas/user.schema';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';
import { LocalStrategy } from '@/auth/strategies/local.strategy';
import { AppConfigService } from '@/config/app-config.service';
import { WebhookModule } from '@/webhook/webhook.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    HttpModule.register({
      timeout: 10000, // 10 seconds timeout
      maxRedirects: 3,
    }),
    JwtModule.registerAsync({
      imports: [],
      useFactory: (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiresIn },
      }),
      inject: [AppConfigService],
    }),
    WebhookModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RecaptchaService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
