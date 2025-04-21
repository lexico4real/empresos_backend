import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SendSmsDto } from './send-sms.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('sms')
@UseGuards(AuthGuard())
@ApiBearerAuth('token')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  async sendSms(@Body() sendSmsDto: SendSmsDto) {
    return await this.smsService.sendSms(sendSmsDto);
  }
}
