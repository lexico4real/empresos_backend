import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiTags } from '@nestjs/swagger';
import { SendEmailDto } from './email.dto';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendMail(@Body() sendEmailDto: SendEmailDto) {
    return this.emailService.sendMail(sendEmailDto);
  }
}
