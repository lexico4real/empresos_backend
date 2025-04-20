import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { GetUser } from './../auth/get-user.decorator';
import { User } from './../auth/entities/user.entity';
import { Account } from './entities/account.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // @Post()
  // async createAccount(): Promise<Account> {
  //   const testUser: User = {
  //     firstName: 'Test',
  //     lastName: 'Test',
  //     password: '',
  //     email: 'lexico4real@yahoo.com',
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //     deletedAt: null,
  //     accounts: [],
  //     accountStatus: 'Active' as any,
  //     userRole: 'CUSTOMER' as any,
  //     id: '',
  //     phoneNumber: '09098098790',
  //     photo: null,
  //     failedLoginAttempts: 0,
  //   };
  //   return this.accountService.createAccount(testUser);
  // }

  @Get()
  async getUserAccounts(@GetUser() user: User): Promise<Account[]> {
    return this.accountService.getUserAccounts(user.id);
  }

  @Get(':accountNumber')
  async getAccountByNumber(
    @Param('accountNumber') accountNumber: string,
  ): Promise<Account> {
    return this.accountService.getAccountByNumber(accountNumber);
  }
}
