import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { Logger } from '@nestjs/common';

async function bootstrap() {

  const logger = new Logger('Orders-main')

  const app = await NestFactory.create(AppModule);

  await app.listen(envs.port);

  logger.log(`Orders Microservices running on port ${envs.port}`)
}
bootstrap();
