import { EntityRepository, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Account } from '../../account/entities/account.entity';
import { User } from 'src/auth/entities/user.entity';
import { Request } from 'express';
import { ILike, FindManyOptions } from 'typeorm';
import { generatePagination } from '../../common/util/pagination';
import { CreateIntlTransferDto } from '../dto/create-intl-transfer.dto';
import { IntlTransaction } from '../entities/intlTransaction.entity';
import moment from 'moment';

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
      dto.senderName = `${sender.user.firstName} ${sender.user.lastName}`;

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

  async getIntlTransactionById(id: string) {
    const txn = await this.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!txn) throw new NotFoundException('Transaction not found');

    return txn;
  }

  async getMonthlyTransactionTotals2(
    user: User,
    year: number,
    month: number,
  ): Promise<{ month: number; total: number }[]> {
    const transactions = await this.createQueryBuilder('intlTransaction')
      .select('EXTRACT(MONTH FROM intlTransaction.createdAt)', 'month')
      .addSelect('SUM(intlTransaction.amount)', 'total')
      .where('intlTransaction.userId = :userId', { userId: user.id })
      .andWhere('EXTRACT(YEAR FROM intlTransaction.createdAt) = :year', {
        year,
      })
      .groupBy('month')
      .getRawMany();

    return transactions.map((transaction) => ({
      month: Number(transaction.month),
      total: Number(transaction.total),
    }));
  }

  async getMonthlyIntlTransactionTotals(senderAccount: string) {
    const currentYear = new Date().getFullYear();

    const rawData = await this.createQueryBuilder('intl_transaction')
      .select('EXTRACT(MONTH FROM intl_transaction.createdAt)', 'month')
      .addSelect('SUM(intl_transaction.amount)', 'total')
      .where('intl_transaction.senderAccount = :senderAccount', {
        senderAccount,
      })
      .andWhere('EXTRACT(YEAR FROM intl_transaction.createdAt) = :year', {
        year: currentYear,
      })
      .groupBy('EXTRACT(MONTH FROM intl_transaction.createdAt)')
      .orderBy('EXTRACT(MONTH FROM intl_transaction.createdAt)')
      .getRawMany();

    const currentMonth = new Date().getMonth();
    const monthlyData = Array.from({ length: currentMonth + 1 }, (_, i) => {
      const found = rawData.find((d) => Number(d.month) === i + 1);
      return {
        month: moment().month(i).format('MMM'),
        total: found ? Number(found.total) : 0,
      };
    });

    return monthlyData;
  }

  async getAllIntlTransactions(
    accountNumber?: string,
    page = 1,
    perPage = 10,
    search?: string,
    req?: Request,
  ) {
    const skip = (page - 1) * perPage;
    let where: FindManyOptions['where'];
    if (accountNumber) {
      where = [
        {
          senderAccount: accountNumber,
          ...(search && { narration: ILike(`%${search}%`) }),
        },
        {
          receiverAccount: accountNumber,
          ...(search && { narration: ILike(`%${search}%`) }),
        },
      ];
    } else {
      where = search ? { narration: ILike(`%${search}%`) } : {};
    }
    const [transactions, total] = await this.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: perPage,
    });
    return generatePagination(page, perPage, total, req, transactions);
  }
}
