import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class VirtualCard extends BaseEntity {
  @Column()
  cardNumber: string;

  @Column()
  cardHolderName: string;

  @Column()
  expiryMonth: string;

  @Column()
  expiryYear: string;

  @Column()
  cvv: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.virtualCards)
  user: User;
}
