import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const webOrigins = process.env.WEB_ORIGIN?.split(',').map((value) => value.trim()).filter(Boolean) || ['http://127.0.0.1:8765', 'http://localhost:8765'];
  app.enableCors({ origin: webOrigins, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  await app.listen(Number(process.env.PORT || 3000));
}

void bootstrap();
