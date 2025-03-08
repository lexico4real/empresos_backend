import { Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaitlistRepository } from './waitlist.repository';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bull';
import { WaitlistProcessor } from './processor/waitlist';
import { BookingRepository } from '../booking/booking.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([WaitlistRepository, BookingRepository]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    BullModule.registerQueue({
      name: 'event_booking_queue',
    }),
  ],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistProcessor],
})
export class WaitlistModule {}
