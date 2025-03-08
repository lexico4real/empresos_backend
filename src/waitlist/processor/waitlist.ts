import {
  Process,
  Processor,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import Logger from '../../../config/log4js/logger';
import { BookingRepository } from '../../booking/booking.repository';
import { EventRepository } from '../../event/event.repository';
import { Connection } from 'typeorm';
import { inspect } from 'util';
import { WaitlistRepository } from '../waitlist.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Event } from '../../event/event.entity';

@Processor('event_booking_queue')
export class WaitlistProcessor {
  private readonly logContext: string = 'event-booking-queue-processor';
  logger = new Logger();

  private readonly bookingRepository: BookingRepository;
  private readonly eventRepository: EventRepository;
  private readonly waitlistRepository: WaitlistRepository;

  constructor(private connection: Connection) {
    this.bookingRepository =
      this.connection.getCustomRepository(BookingRepository);
    this.eventRepository = this.connection.getCustomRepository(EventRepository);
    this.waitlistRepository =
      this.connection.getCustomRepository(WaitlistRepository);
  }

  /**
   * Process job to book an event.
   * Either books the event or adds the user to the waitlist if tickets are unavailable.
   */
  @Process('event_booking_queue')
  async processEventBooking(
    job: Job<{ event: Event; userEmail: string; ticketNumber: number }>,
  ): Promise<void> {
    const { event, userEmail, ticketNumber } = job.data;

    this.logger.log(
      'info',
      'info',
      `Processing job ${job.id} of type ${job.name} with data ${inspect(
        job.data,
      )}`,
      this.logContext,
    );

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const foundEvent = await this.eventRepository.getEventById(event.id);

      if (!foundEvent) return;

      const { availableTickets } = foundEvent;

      if (availableTickets > 0) {
        await this.bookingRepository.bookTicket({
          eventId: event.id,
          userEmail,
          ticketNumber,
        });
        this.logger.log(
          'info',
          'info',
          `Successfully booked ${ticketNumber} tickets for ${userEmail}`,
          this.logContext,
        );
      } else {
        await this.waitlistRepository.addToWaitlist({
          eventId: event.id,
          userEmail,
        });
        this.logger.log(
          'info',
          'info',
          `No tickets available. User ${userEmail} added to waitlist for event ${event.id}`,
          this.logContext,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.log(
        'error',
        'error',
        `Booking failed for ${userEmail}. Error: ${error.message}`,
        this.logContext,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Cron job to assign tickets to users on the waitlist.
   * Runs every hour to check for available tickets and assigns them to waitlisted users.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async assignTicketsToWaitlist(): Promise<void> {
    this.logger.log(
      'info',
      'info',
      `Executing waitlist ticket assignment cron job.`,
      this.logContext,
    );

    const eventsWithWaitlist = await this.waitlistRepository.getWaitlist();

    if (eventsWithWaitlist.length === 0) return;

    for (const eventWaitlist of eventsWithWaitlist) {
      if (!eventWaitlist?.event?.id) return;

      const event = await this.eventRepository.getEventById(
        eventWaitlist.event.id,
      );

      if (!event) continue;

      let { availableTickets } = event;

      if (availableTickets > 0) {
        const waitlistedUsers =
          await this.waitlistRepository.getWaitlistedUsers(event.id);

        for (const user of waitlistedUsers) {
          if (availableTickets > 0) {
            await this.waitlistRepository.assignTicketFromWaitlist(
              event.id,
              user.userEmail,
            );
            this.logger.log(
              'info',
              'info',
              `Assigned ticket to ${user.userEmail} from waitlist for event ${event.id}`,
              this.logContext,
            );
            availableTickets--;
          } else {
            break;
          }
        }
      }
    }
  }

  /**
   * Callback for when a job completes successfully.
   */
  @OnQueueCompleted()
  async onComplete(job: Job, msg: any): Promise<void> {
    const logMsg = `Job ${job?.id} of type ${job?.name} has completed with message: ${msg}.`;
    await job.remove();
    this.logger.log('info', 'info', logMsg, this.logContext);
  }

  /**
   * Callback for when there is an error in the queue.
   */
  @OnQueueError()
  async onError(job: Job, error: { message: any; code: any }): Promise<void> {
    const logMsg = {
      message: error?.message,
      errorCode: error?.code,
      queueError: error,
    };
    this.logger.log('error', 'error', JSON.stringify(logMsg), this.logContext);
  }

  /**
   * Callback for when a job fails.
   */
  @OnQueueFailed()
  async onFailed(job: Job, msg: any): Promise<void> {
    const logMsg = `Job ${job.id} failed with message: ${msg}!`;
    this.logger.log('error', 'error', logMsg, this.logContext);
  }
}
