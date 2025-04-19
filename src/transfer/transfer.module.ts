import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { EmailService } from './../email/email.service';
import { AccountModule } from './../account/account.module';
import { TransactionRepository } from './transaction.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionRepository]),
    AccountModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TransferController],
  providers: [TransferService, EmailService],
})
export class TransferModule {}
