import { Controller, Post, Body } from '@nestjs/common';
import { WhatsAppService } from './whats-app.service';
import { SendMessageDto } from './send-message.dto';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('send')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return await this.whatsappService.sendWhatsAppMessage(sendMessageDto);
  }
}
