import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WhatsAppService } from './whats-app.service';
import { SendMessageDto } from './send-message.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('whatsapp')
@UseGuards(AuthGuard())
@ApiBearerAuth('token')
@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('send')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return await this.whatsappService.sendWhatsAppMessage(sendMessageDto);
  }
}
