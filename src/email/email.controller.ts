import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SendEmailDto } from './email.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('email')
@UseGuards(AuthGuard())
@ApiBearerAuth('token')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendMail(@Body() sendEmailDto: SendEmailDto) {
    return this.emailService.sendMail(sendEmailDto);
  }
}
