import { Column, Entity } from 'typeorm';
import { BaseEntity } from './../../base.entity';

@Entity()
export class UserPrivilege extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  comment: string;
}
