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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { TransferService } from './transaction.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
    page?: number,
    perPage?: number,
    search?: string,
  ) {
    return this.transferService.getIntlTransactionHistory(
      req?.user as User,
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
