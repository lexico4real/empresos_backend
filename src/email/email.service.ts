import { Injectable, BadRequestException } from '@nestjs/common';
import { Resend } from 'resend';
import { SendEmailDto } from './email.dto';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    const { RESEND_API_KEY } = process.env;

    if (!RESEND_API_KEY) {
      throw new BadRequestException(
        'RESEND_API_KEY is not set in environment variables',
      );
    }

    this.resend = new Resend(RESEND_API_KEY);
  }

  async sendMail(sendEmailDto: SendEmailDto) {
    const { to, subject, text, html } = sendEmailDto;

    try {
      const response = await this.resend.emails.send({
        from: 'Empresos <onboarding@resend.dev>',
        to,
        subject,
        text,
        html,
      });

      return response;
    } catch (error) {
      console.error('Email sending failed via Resend:', error);
      throw new BadRequestException('Failed to send email');
    }
  }
}
