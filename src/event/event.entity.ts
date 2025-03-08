import { Booking } from '../booking/booking.entity';
import { BaseEntity } from '../base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Waitlist } from '../waitlist/waitlist.entity';
import { EventStatus } from './event-status.enum';

@Entity()
export class Event extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'int', default: 0, nullable: false })
  totalTickets: number;

  @Column({ type: 'int', default: 0, nullable: false })
  availableTickets: number;

  @OneToMany(() => Booking, (booking) => booking.event)
  bookings: Booking[];

  @OneToMany(() => Waitlist, (waitlist) => waitlist.event)
  waitlist: Waitlist[];

  @Column({ default: EventStatus.OPEN })
  status?: EventStatus;
}
