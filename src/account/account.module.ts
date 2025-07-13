import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountRepository } from './account.repository';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [
    CacheModule,
    TypeOrmModule.forFeature([AccountRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
