import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class IntlTransaction extends BaseEntity {
  @Column()
  senderName: string;

  @Column()
  senderAccount: string;

  @Column()
  receiverName: string;

  @Column()
  receiverAccount: string;

  @Column()
  receiverBankName: string;

  @Column()
  receiverBankSwiftCode: string;

  @Column({ nullable: true })
  receiverPhone?: string;

  @Column()
  receiverCountry: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  narration: string;

  @ManyToOne(() => User)
  user: User;
}
