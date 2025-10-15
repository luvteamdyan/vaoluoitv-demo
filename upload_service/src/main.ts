import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT || 3002;


  // Create microservice application
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: parseInt(port.toString()),
      },
    },
  );

  // Start microservice
  await app.listen();

  console.log(`Upload Microservice running on port ${port}`);
}
void bootstrap();
