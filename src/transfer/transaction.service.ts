import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Connection } from 'typeorm';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransactionRepository } from './transaction.repository';
import { EmailService } from '../email/email.service';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(TransactionRepository)
    private readonly txnRepo: TransactionRepository,
    private readonly emailService: EmailService,
    private readonly connection: Connection,
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
}
