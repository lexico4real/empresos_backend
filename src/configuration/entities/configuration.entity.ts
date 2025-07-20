import { BaseEntity } from 'src/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Configuration extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column()
  value: string;
}
