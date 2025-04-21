import { EntityRepository, Repository } from 'typeorm';
import { VirtualCard } from './entities/virtual-card.entity';
import { User } from '../auth/entities/user.entity';
import { CreateVirtualCardDto } from './dto/create-virtual-card.dto';

@EntityRepository(VirtualCard)
export class VirtualCardRepository extends Repository<VirtualCard> {
  async createCard(
    user: User,
    dto: CreateVirtualCardDto,
    cardNumber: string,
    expiryMonth: string,
    expiryYear: string,
    cvv: string,
  ) {
    const card = this.create({
      ...dto,
      user,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
    });

    return this.save(card);
  }

  async getCards(user: User) {
    return this.find({ where: { user } });
  }

  async blockCard(id: string, user: User) {
    const card = await this.findOne({ where: { id, user } });
    if (!card) throw new Error('Card not found');

    card.isActive = false;
    return this.save(card);
  }
}
