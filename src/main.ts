import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import compression from 'compression';
import 'dotenv';
import ClusterConfig from './config/system/cluster';
import CorsConfig from './config/system/cors';
import SwaggerConfig from './config/swagger/config';
import { TransformInterceptor } from './config/interceptor/transform.interceptor';
import { SeedService } from './seed/seed.service';
import { User } from './auth/entities/user.entity';
import { getConnection } from 'typeorm';

async function bootstrap() {
  const cluster = new ClusterConfig();
  const cors = new CorsConfig();
  const doc = new SwaggerConfig();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  await cors.set(app);
  app.setGlobalPrefix('/api/v1');
  await doc.set(app);
  app.use(compression());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableShutdownHooks();
  if (process.env.NODE_ENV !== 'production') {
    const connection = getConnection();
    const userRepo = connection.getRepository(User);
    const count = await userRepo.count();
    if (count === 0) {
      console.log('🔄 Seeding database...');
      await app.get(SeedService).seed();
    } else {
      console.log(`✅ Skipping seed — ${count} users already exist.`);
    }
  }
  await cluster.set(app);
}
bootstrap();
