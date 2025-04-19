import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { SendMessageDto } from './send-message.dto';

dotenv.config();

@Injectable()
export class WhatsAppService {
  private readonly API_URL = 'https://graph.facebook.com/v19.0';
  private readonly PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID; // Get from Meta Dashboar
  private readonly ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN; // Get from Meta Developer Portal

  async sendWhatsAppMessage(sendMessageDto: SendMessageDto) {
    const { to, message } = sendMessageDto;
    try {
      const response = await axios.post(
        `${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${this.ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error(
        'WhatsApp API Error:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to send WhatsApp message');
    }
  }
}
