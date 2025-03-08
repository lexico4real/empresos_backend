import { BaseEntity } from '../base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Event } from '../event/event.entity';

@Entity()
export class Waitlist extends BaseEntity {
  @Column({ type: 'int', default: () => "nextval('queue_id_seq')" })
  queueId: number;

  @Column()
  userEmail: string;

  @ManyToOne(() => Event, (event) => event.waitlist, { onDelete: 'CASCADE' })
  event: Event;
}
