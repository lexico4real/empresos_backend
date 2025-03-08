import { BaseEntity } from '../base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from '../event/event.entity';

@Entity()
export class Booking extends BaseEntity {

  @Column()
  userEmail: string;

  @Column()
  ticketNumber: number;

  @ManyToOne(() => Event, (event) => event.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;
}
