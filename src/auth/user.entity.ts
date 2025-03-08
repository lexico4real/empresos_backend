import { Role } from '../../common/role.enum';
import { BaseEntity } from './../base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column('simple-array', { nullable: true, default: ['Admin'] })
  roles: Role[];
}
