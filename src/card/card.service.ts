import { Injectable } from '@nestjs/common';
import { CreateVirtualCardDto } from './dto/create-virtual-card.dto';
import { VirtualCardRepository } from './virtual-card.repository';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class CardService {
  constructor(private readonly virtualCardRepository: VirtualCardRepository) {}

  async createCard(user: User) {
    const cardHolderName = `${user.firstName} ${user.lastName}`;
    const result = await this.virtualCardRepository.createCard(
      user,
      { cardHolderName },
      this.generateCardNumber(),
      this.generateExpiry().month,
      this.generateExpiry().year,
      this.generateCVV(),
    );
    delete result.user.password;

    return result;
  }

  async getCards(user: User) {
    return await this.virtualCardRepository.getCards(user);
  }

  async blockCard(id: string, user: User) {
    return await this.virtualCardRepository.blockCard(id, user);
  }

  private generateCardNumber(): string {
    return (
      '4' +
      Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('')
    );
  }

  private generateExpiry(): { month: string; year: string } {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear() + 3).slice(2);
    return { month, year };
  }

  private generateCVV(): string {
    return String(Math.floor(100 + Math.random() * 900));
  }
}
