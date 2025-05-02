import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { UserPrivilege } from './user-privilege.entity';
import { BaseEntity } from './../../base.entity';
import { User } from './user.entity';

@Entity()
export class UserRole extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  comment: string;

  @ManyToMany(() => UserPrivilege, { cascade: true })
  @JoinTable()
  userPrivileges: UserPrivilege[];

  @OneToMany(() => User, (user) => user.userRole)
  users: User[];
}
