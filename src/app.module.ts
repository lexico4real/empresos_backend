import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { getTypeOrmConfig } from './../config/orm/global';
import { SmsModule } from './sms/sms.module';
import { EmailModule } from './email/email.module';
import { OtpModule } from './otp/otp.module';
import { CacheModule } from './cache/cache.module';
import { WhatsAppModule } from './whats-app/whats-app.module';
import { AccountModule } from './account/account.module';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getTypeOrmConfig(configService),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_DB_HOST,
        port: Number(process.env.REDIS_DB_PORT),
        password: process.env.REDIS_DB_AUTH,
      },
    }),
    SmsModule,
    EmailModule,
    OtpModule,
    CacheModule,
    WhatsAppModule,
    AccountModule,
    TransferModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
