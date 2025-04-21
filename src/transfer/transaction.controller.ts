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
import { ApiTags } from '@nestjs/swagger';
import { User } from '../auth/entities/user.entity';

@UseGuards(AuthGuard())
@ApiTags('transaction')
@Controller('transaction')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post('transfer')
  transferMoney(@Body() dto: CreateTransferDto, @Req() req: Request) {
    return this.transferService.transferMoney(dto);
  }

  @Get('history')
  getTransactionHistory(@Req() req: Request) {
    return this.transferService.getTransactionHistory(req?.user as User);
  }
}
