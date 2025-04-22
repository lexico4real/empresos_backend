import { EntityRepository, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Account } from '../account/entities/account.entity';
import { User } from 'src/auth/entities/user.entity';
import { Request } from 'express';
import { ILike, FindManyOptions } from 'typeorm';
import { generatePagination } from '../common/util/pagination';
import { CreateIntlTransferDto } from './dto/create-intl-transfer.dto';
import { IntlTransaction } from './entities/intlTransaction.entity';

@EntityRepository(IntlTransaction)
export class IntlTransactionRepository extends Repository<IntlTransaction> {
  async initiateIntlTransfer(connection, dto: CreateIntlTransferDto) {
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

      // const receiver = await queryRunner.manager.findOne(Account, {
      //   where: { accountNumber: receiverAccount },
      //   relations: ['user'],
      // });

      if (!sender) throw new NotFoundException('Invalid account(s)');
      if (!sender.isActive) throw new BadRequestException('Inactive account');
      if (Number(sender.balance) < amount)
        throw new BadRequestException('Insufficient funds');

      sender.balance -= amount;

      await queryRunner.manager.save(sender);

      const txn = this.create({
        senderAccount: senderAccount,
        receiverAccount: receiverAccount,
        amount,
        narration: narration || `Cash transfer to ${receiverAccount}`,
        ...dto,
        user: sender.user,
      });

      await queryRunner.manager.save(txn);

      await queryRunner.commitTransaction();
      return {
        txn,
        sender,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getIntlTransactionHistory(
    user: User,
    page = 1,
    perPage = 10,
    search?: string,
    req?: Request,
  ) {
    const skip = (page - 1) * perPage;

    const where: FindManyOptions['where'] = {
      user,
      ...(search && {
        narration: ILike(`%${search}%`),
      }),
    };

    const [transactions, total] = await this.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: perPage,
    });

    return generatePagination(page, perPage, total, req, transactions);
  }
}
