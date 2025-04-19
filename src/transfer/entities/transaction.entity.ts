import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './../../base.entity';
import { User } from './../../auth/entities/user.entity';

@Entity()
export class Transaction extends BaseEntity {
  @Column()
  senderAccount: string;

  @Column()
  receiverAccount: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  narration: string;

  @ManyToOne(() => User)
  user: User;
}
