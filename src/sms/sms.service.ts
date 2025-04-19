import { Injectable } from '@nestjs/common';
import { Vonage } from '@vonage/server-sdk';
import { Auth } from '@vonage/auth';
import { SendSmsDto } from './send-sms.dto';

@Injectable()
export class SmsService {
  private vonage: Vonage;

  constructor() {
    const apiKey = process.env.VONAGE_API_KEY;
    const apiSecret = process.env.VONAGE_API_SECRET;
    if (!apiKey || !apiSecret) {
      throw new Error('Vonage API credentials are missing.');
    }
    const credentials = new Auth({
      apiKey,
      apiSecret,
    });

    this.vonage = new Vonage(credentials);
  }

  async sendSms(sendSmsDto: SendSmsDto) {
    const { to, message } = sendSmsDto;
    try {
      const response = await this.vonage.sms.send({
        to,
        from: 'Empresos',
        text: message,
      });

      return response;
    } catch (error) {
      console.error('SMS Sending Error:', error);
      throw error;
    }
  }
}
