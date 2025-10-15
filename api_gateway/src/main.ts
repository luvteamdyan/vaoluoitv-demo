import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CommandFactory } from 'nest-commander';
import { AppModule } from '@/app.module';
import { AppConfigService } from '@/config/app-config.service';

async function bootstrap() {
  // Check if running as command
  if (process.argv.length > 2 && process.argv[2] === 'sync-matches') {
    // Run as command
    await CommandFactory.run(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    return;
  }

  // Run as web server
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
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:8386',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
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

  // Swagger Configuration - chỉ bật trong development
  if (configService.nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('VaoLuoiTV API')
      .setDescription(
        'API documentation cho VaoLuoiTV - Nền tảng streaming bóng đá trực tiếp',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Health', 'Health check endpoints')
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Matches', 'Football match management endpoints')
      .addTag('Stream Keys', 'Stream key management endpoints')
      .addTag('Chat', 'Real-time chat endpoints')
      .addTag('Ads Config', 'Advertisement configuration endpoints')
      .addTag('Upload', 'File upload endpoints')
      .addTag('Secure API', 'Secure API endpoints')
      .addTag('Stream Auth', 'Stream authentication endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'API Documentation VaoLuoiTV',
      customfavIcon: '/favicon.ico',
      customCss: '.swagger-ui .topbar { display: none }',
    });
  }

  await app.listen(configService.port);
}
void bootstrap();
