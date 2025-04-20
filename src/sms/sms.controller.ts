import { Body, Controller, Post } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SendSmsDto } from './send-sms.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('sms')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  async sendSms(@Body() sendSmsDto: SendSmsDto) {
    return await this.smsService.sendSms(sendSmsDto);
  }
}
