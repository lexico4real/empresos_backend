import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateVirtualCardDto } from './dto/create-virtual-card.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('card')
@UseGuards(AuthGuard())
@ApiBearerAuth('token')
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('issue')
  createCard(@Req() req) {
    return this.cardService.createCard(req?.user);
  }

  @Get()
  getCards(@Req() req) {
    return this.cardService.getCards(req.user);
  }

  @Patch(':id/block')
  blockCard(@Req() req, @Param('id') id: string) {
    return this.cardService.blockCard(id, req.user);
  }
}
