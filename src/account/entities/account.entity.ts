import { User } from 'src/auth/entities/user.entity';
import { BaseEntity } from './../../base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class Account extends BaseEntity {
  @Column()
  accountNumber: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.accounts, {
    onDelete: 'CASCADE',
    nullable: false,
    eager: true,
  })
  user: User;
}
