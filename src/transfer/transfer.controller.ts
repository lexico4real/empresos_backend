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
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@UseGuards(AuthGuard())
@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @Post()
  transfer(@Body() dto: CreateTransferDto, @Req() req: Request) {
    console.log(req.user);
    return this.transferService.transfer(dto);
  }
}
