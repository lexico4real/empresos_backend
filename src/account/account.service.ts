import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountRepository } from './account.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './../auth/entities/user.entity';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountRepository)
    private readonly accountRepo: AccountRepository,
  ) {}

  async createAccount(user: User): Promise<Account> {
    return await this.accountRepo.createAccount(user);
  }

  async getUserAccounts(userId: string): Promise<Account[]> {
    return await this.accountRepo.getUserAccounts(userId);
  }

  async getAccountByNumber(accountNumber: string): Promise<Account> {
    return await this.accountRepo.getByAccountNumber(accountNumber);
  }

  async updateBalance(accountNumber: string, amount: number): Promise<Account> {
    return await this.accountRepo.updateBalance(accountNumber, amount);
  }
}
