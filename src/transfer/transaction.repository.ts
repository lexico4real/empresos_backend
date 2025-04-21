import { EntityRepository, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Transaction } from './entities/transaction.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Account } from './../account/entities/account.entity';
import { User } from 'src/auth/entities/user.entity';

@EntityRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {
  async transfer(connection, dto: CreateTransferDto) {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { senderAccount, receiverAccount, amount, narration } = dto;

      if (!senderAccount) {
        throw new NotFoundException('Sender Not Found');
      }

      const sender = await queryRunner.manager.findOne(Account, {
        where: { accountNumber: senderAccount },
        relations: ['user'],
      });

      const receiver = await queryRunner.manager.findOne(Account, {
        where: { accountNumber: receiverAccount },
        relations: ['user'],
      });

      if (!sender || !receiver)
        throw new NotFoundException('Invalid account(s)');
      if (!sender.isActive || !receiver.isActive)
        throw new BadRequestException('Inactive account');
      if (sender.id === receiver.id)
        throw new BadRequestException('Cannot transfer to same account');
      if (Number(sender.balance) < amount)
        throw new BadRequestException('Insufficient funds');

      sender.balance -= amount;
      receiver.balance += amount;

      await queryRunner.manager.save(sender);
      await queryRunner.manager.save(receiver);

      const txn = this.create({
        senderAccount: senderAccount,
        receiverAccount: receiverAccount,
        amount,
        narration,
        user: sender.user,
      });

      await queryRunner.manager.save(txn);

      await queryRunner.commitTransaction();
      return {
        txn,
        sender,
        receiver,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactionHistory(user: User) {
    return await this.find({
      where: { user },
      order: { createdAt: 'DESC' },
    });
  }
}
