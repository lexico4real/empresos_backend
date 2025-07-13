/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersRepository } from './repositories/users.repository';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { SmsModule } from './../sms/sms.module';
import { OtpModule } from './../otp/otp.module';
import { UserPrivilegeRepository } from './repositories/user-privilege.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { AccountModule } from './../account/account.module';
import { CookieSessionModule } from 'nestjs-cookie-session';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [
    CacheModule,
    SmsModule,
    OtpModule,
    ConfigModule,
    AccountModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: process.env.JWT_SECRET || configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: process.env.EXPIRESIN || '10h',
        },
      }),
    }),
    TypeOrmModule.forFeature([
      UsersRepository,
      UserPrivilegeRepository,
      UserRoleRepository,
    ]),
    CookieSessionModule.forRoot({
      session: { secret: 'top secret', maxAge: 60 * 60 * 1000 * 8 },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 30,
        limit: 10,
      },
    ]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule, JwtModule, RolesGuard, AuthService],
})
export class AuthModule {}
