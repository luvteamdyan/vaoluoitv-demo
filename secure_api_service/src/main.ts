import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfigService } from './common/config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(AppConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix removed - controllers now handle their own prefixes
  // app.setGlobalPrefix('api');

  const port = configService.port;
  await app.listen(Number(port));

  console.log(`🔐 Security API Microservice running on port ${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}`);
}

void bootstrap();
