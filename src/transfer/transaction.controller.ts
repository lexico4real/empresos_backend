import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TransferService } from './transaction.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '../auth/entities/user.entity';
import { CreateIntlTransferDto } from './dto/create-intl-transfer.dto';

@ApiTags('transaction')
@UseGuards(AuthGuard())
@ApiBearerAuth('token')
@Controller('transaction')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Get('history')
  getTransactionHistory(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('search') search?: string,
  ) {
    return this.transferService.getTransactionHistory(
      req?.user as User,
      page,
      perPage,
      search,
      req,
    );
  }

  @Get('bank/list')
  getBanks() {
    return this.transferService.getBank();
  }

  @Post('transfer/intl')
  initiateIntltransfer(@Body() dto: CreateIntlTransferDto) {
    return this.transferService.initiateIntlTransfer(dto);
  }

  @Get('history/intl')
  getIntlTransactionHistory(
    @Req() req: Request,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('search') search?: string,
  ) {
    return this.transferService.getIntlTransactionHistory(
      req?.user as User,
      page,
      perPage,
      search,
      req,
    );
  }

  @Get('all-history/intl')
  @ApiQuery({
    name: 'accountNumber',
    required: false,
    type: String,
    description: 'Account number to filter transactions',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for transactions',
  })
  getAllIntlTransactions(
    @Query('accountNumber') accountNumber?: string,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('search') search?: string,
    @Req() req?: Request,
  ) {
    return this.transferService.getAllIntlTransactions(
      accountNumber,
      page,
      perPage,
      search,
      req,
    );
  }

  @Get('history/local')
  getLocalTransactionHistory(
    @Req() req: Request,
    page?: number,
    perPage?: number,
    search?: string,
  ) {
    return this.transferService.getTransactionHistory(
      req?.user as User,
      page,
      perPage,
      search,
      req,
    );
  }

  @Get('intl-transaction/total')
  async getMonthlyIntlTransactionTotals(senderAccount: string) {
    const transactions =
      await this.transferService.getMonthlyIntlTransactionTotals(senderAccount);
    return transactions;
  }

  @Post('transfer/local')
  transferMoney(@Body() dto: CreateTransferDto, @Req() req: Request) {
    return this.transferService.transferMoney(req, dto);
  }
}
