import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './../../base.entity';
import { AccountStatus } from '@common/enums/account-status.enum';
import { UserRole } from './user-role.entity';
import { Account } from './../../account/entities/account.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Index('user_account_status_idx')
  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  accountStatus: AccountStatus;

  @Column({ nullable: true })
  photo: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @ManyToOne(() => UserRole, { eager: true, nullable: true })
  @JoinColumn({ name: 'userRoleId' })
  userRole: UserRole;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];
}
