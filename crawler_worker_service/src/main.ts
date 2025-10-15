import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(AppConfigService);

  // CORS Configuration - Allow production domains and localhost
  const allowedOrigins = [
    // Production domains
    'https://vaoluoitv.com',
    'https://www.vaoluoitv.com',
    'https://games.vaoluoitv.com',
    'https://admin.vaoluoitv.com',
    'https://members.vaoluoitv.com',
    // Development/localhost
    'http://localhost:3000',
    'http://localhost:3004',
    'http://localhost:8080',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:8386',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3004',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:8386',
  ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cookie',
    ],
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = configService.port;

  // Swagger Configuration - chỉ bật trong development
  if (configService.nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('VaoLuoiTV Sync Service API')
      .setDescription(
        'API documentation for VaoLuoiTV Sync Microservice - Dedicated service for match synchronization with JWT authentication',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  } else {
    console.log('🔒 Swagger documentation disabled in production environment');
  }
  await app.listen(port);

  console.log(
    `🚀 VaoLuoiTV Sync Service is running on: http://localhost:${port}`,
  );
}
bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
