import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { GetUser } from './../auth/get-user.decorator';
import { User } from './../auth/entities/user.entity';
import { Account } from './entities/account.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@ApiTags('account')
@UseGuards(AuthGuard())
@ApiBearerAuth('token')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  async getUserAccounts(@GetUser() user: User): Promise<Account[]> {
    return this.accountService.getUserAccounts(user.id);
  }

  @Get('list')
  async getAllAccounts(
    @Query('page') page: string,
    @Query('perPage') perPage: string,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    const pageNum = parseInt(page) || 1;
    const perPageNum = parseInt(perPage) || 10;

    return this.accountService.getAllAccounts(pageNum, perPageNum, search, req);
  }

  @Get(':accountNumber')
  async getAccountByNumber(
    @Param('accountNumber') accountNumber: string,
  ): Promise<Account> {
    return this.accountService.getAccountByNumber(accountNumber);
  }

  @Patch(':accountId/balance')
  async updateBalance(
    @Param('accountId') accountId: string,
    @Body('amount') amount: number,
  ): Promise<Account> {
    return this.accountService.updateBalance(accountId, amount);
  }
}
