import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountRepository } from './account.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './../auth/entities/user.entity';
import { Account } from './entities/account.entity';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountRepository)
    private readonly accountRepo: AccountRepository,
    private readonly cacheService: CacheService,
  ) {}

  async createAccount(user: User): Promise<Account> {
    await this.cacheService.delWithPattern('all_accounts_*');
    return await this.accountRepo.createAccount(user);
  }

  async getUserAccounts(userId: string): Promise<Account[]> {
    return await this.accountRepo.getUserAccounts(userId);
  }

  async getAccountByNumber(accountNumber: string): Promise<Account> {
    return await this.accountRepo.getByAccountNumber(accountNumber);
  }

  async updateBalance(accountId: string, amount: number): Promise<Account> {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new BadRequestException('Invalid amount provided');
    }
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
    await this.cacheService.delWithPattern('all_accounts_*');
    return await this.accountRepo.updateBalance(accountId, amount);
  }

  async getAllAccounts(
    page = 1,
    perPage = 10,
    search?: string,
    req?: any,
  ): Promise<any> {
    const cacheKey = `all_accounts_${page}_${perPage}_${search ?? ''}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const result = await this.accountRepo.getAllAccounts(
      page,
      perPage,
      search,
      req,
    );
    this.cacheService.set(cacheKey, JSON.stringify(result));
    return result;
  }
}
