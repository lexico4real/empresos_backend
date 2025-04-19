import { EntityRepository, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Account } from './entities/account.entity';
import { User } from './../auth/entities/user.entity';

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

  async updateBalance(accountNumber: string, amount: number) {
    const account = await this.getByAccountNumber(accountNumber);
    account.balance += amount;
    return this.save(account);
  }

  private generateAccountNumber(): string {
    const prefix = '33';
    const random = Math.floor(Math.random() * 1e10)
      .toString()
      .padStart(10, '0');
    return prefix + random.slice(0, 8);
  }
}
