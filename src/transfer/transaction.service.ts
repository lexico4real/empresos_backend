import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Connection } from 'typeorm';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransactionRepository } from './transaction.repository';
import { EmailService } from '../email/email.service';
import { User } from '../auth/entities/user.entity';
import { CreateIntlTransferDto } from './dto/create-intl-transfer.dto';
import { IntlTransactionRepository } from './intl-transaction.repository';
import { INTL_BANKS } from '../common/intl-banks';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(TransactionRepository)
    private readonly txnRepo: TransactionRepository,
    @InjectRepository(IntlTransactionRepository)
    private readonly intlTxnRepo: IntlTransactionRepository,
    private readonly emailService: EmailService,
    private readonly connection: Connection,
    private readonly cacheService: CacheService,
  ) {}

  async transferMoney(dto: CreateTransferDto) {
    const { sender, receiver, txn } = await this.txnRepo.transfer(
      this.connection,
      dto,
    );

    await Promise.all([
      this.emailService.sendMail({
        to: sender.user.email,
        subject: 'Debit Alert',
        text: `You have transferred $${txn.amount} to ${receiver.user.firstName} ${receiver.user.lastName}. Narration: ${txn.narration}`,
      }),
      this.emailService.sendMail({
        to: sender.user.email,
        subject: 'Credit Alert',
        text: `You have been credited $${txn.amount} from ${sender.user.firstName} ${sender.user.lastName}. Narration: ${txn.narration}`,
      }),
    ]);

    return {
      success: true,
      message: 'Transfer completed',
      txn,
    };
  }

  async getTransactionHistory(
    user: User,
    page?: number,
    perPage?: number,
    search?: string,
    req?: Request,
  ) {
    return await this.txnRepo.getTransactionHistory(
      user,
      page,
      perPage,
      search,
      req,
    );
  }

  async initiateIntlTransfer(dto: CreateIntlTransferDto) {
    const { sender, txn } = await this.intlTxnRepo.initiateIntlTransfer(
      this.connection,
      dto,
    );

    await Promise.all([
      this.emailService.sendMail({
        to: sender.user.email,
        subject: 'Debit Alert',
        text: `You have transferred $${txn.amount} to ${dto.receiverName}. Narration: ${txn.narration}`,
      }),
      this.emailService.sendMail({
        to: sender.user.email,
        subject: 'Credit Alert',
        text: `You have been credited $${txn.amount} from ${sender.user.firstName} ${sender.user.lastName}. Narration: ${txn.narration}`,
      }),
    ]);

    return {
      transactionId: txn.id,
      message: 'Transaction initiated successully',
      details: dto,
    };
  }

  async getIntlTransactionHistory(
    user: User,
    page?: number,
    perPage?: number,
    search?: string,
    req?: Request,
  ) {
    return await this.intlTxnRepo.getIntlTransactionHistory(
      user,
      page,
      perPage,
      search,
      req,
    );
  }

  async getBank() {
    const cacheKey = 'intl_banks';
    const cachedData = await this.getFromCache(cacheKey);

    if (cachedData && cachedData.length) {
      return cachedData;
    }

    const data = INTL_BANKS;

    await this.setInCache(cacheKey, data);

    return data;
  }

  private async getFromCache(key: string) {
    const cachedData = await this.cacheService.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  private async setInCache(key: string, data: any) {
    await this.cacheService.set(key, JSON.stringify(data), 3600);
  }
}
