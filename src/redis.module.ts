import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_DB_HOST', '127.0.0.1');
        const port = configService.get<number>('REDIS_DB_PORT', 6379);
        const password = configService
          .get<string>('REDIS_DB_AUTH', '')
          ?.replace(/\\/g, '');
        return new Redis({
          host,
          port,
          password,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
