import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ForbiddenException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Si vienen props que no tienen que venir se lanza un error
      forbidNonWhitelisted: true
    })
  );

  await app.listen(3000);
}
bootstrap();
