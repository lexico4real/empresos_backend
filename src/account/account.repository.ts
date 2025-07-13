import { EntityRepository, Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Account } from './entities/account.entity';
import { User } from './../auth/entities/user.entity';
import { generatePagination } from 'src/common/util/pagination';

@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {
  async createAccount(user: User) {
    try {
      const account = this.create({
        accountNumber: this.generateAccountNumber(),
        user,
        balance: 0,
      });
      return await this.save(account);
    } catch (error) {
      throw new BadRequestException('Account creation failed.');
    }
  }

  async getUserAccounts(userId: string) {
    return this.find({ where: { user: { id: userId } } });
  }

  async getByAccountNumber(accountNumber: string) {
    const account = await this.findOne({
      where: { accountNumber },
      relations: ['user'],
    });

    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async updateBalance(accountId: string, amount: number) {
    const account = await this.findOne(accountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    account.balance = +account.balance + amount;
    return await this.save(account);
  }

  async getAllAccounts(
    page = 1,
    perPage = 10,
    search?: string,
    req?: any,
  ): Promise<any> {
    try {
      const skip = (page - 1) * perPage;

      const query = this.createQueryBuilder('account').leftJoinAndSelect(
        'account.user',
        'user',
      );

      if (search) {
        query.where(
          'user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search',
          {
            search: `%${search}%`,
          },
        );
      }

      query.orderBy('account.createdAt', 'DESC').skip(skip).take(perPage);

      const [result, total] = await query.getManyAndCount();

      for (const account of result) {
        if (account.user) {
          delete account.user.password;
        }
      }

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong while fetching accounts',
      );
    }
  }

  private generateAccountNumber(): string {
    const prefix = '33';
    const random = Math.floor(Math.random() * 1e10)
      .toString()
      .padStart(10, '0');
    return prefix + random.slice(0, 8);
  }
}
