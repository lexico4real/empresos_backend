import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransactionRepository } from './transaction.repository';
import { EmailService } from './../email/email.service';
import { Connection } from 'typeorm';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(TransactionRepository)
    private readonly txnRepo: TransactionRepository,
    private readonly emailService: EmailService,
    private readonly connection: Connection,
  ) {}

  async transfer(dto: CreateTransferDto) {
    const { sender, receiver, txn } = await this.txnRepo.transfer(
      this.connection,
      dto,
    );

    await this.emailService.sendMail(
      sender.user.email,
      'Debit Alert',
      `You have transferred ₦${txn.amount} to ${receiver.user.firstName} ${receiver.user.lastName}. Narration: ${txn.narration}`,
    );
    return {
      success: true,
      message: 'Transfer completed',
      txn,
    };
  }
}
