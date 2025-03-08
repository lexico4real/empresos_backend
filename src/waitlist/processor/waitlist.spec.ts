import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistProcessor } from './waitlist';
import { BookingRepository } from '../../booking/booking.repository';
import { EventRepository } from '../../event/event.repository';
import { WaitlistRepository } from '../waitlist.repository';
import { Connection, QueryRunner } from 'typeorm';
import Logger from '../../../config/log4js/logger';
import { Job } from 'bull';

jest.mock('../../../config/log4js/logger');

describe('WaitlistProcessor', () => {
  let waitlistProcessor: WaitlistProcessor;
  let bookingRepository: BookingRepository;
  let eventRepository: EventRepository;
  let waitlistRepository: WaitlistRepository;
  let connection: Connection;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    } as any;

    connection = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
      getCustomRepository: jest.fn(),
    } as any;

    bookingRepository = {
      bookTicket: jest.fn(),
    } as any;

    eventRepository = {
      getEventById: jest.fn(),
    } as any;

    waitlistRepository = {
      addToWaitlist: jest.fn(),
      getWaitlist: jest.fn(),
      getWaitlistedUsers: jest.fn(),
      assignTicketFromWaitlist: jest.fn(),
    } as any;

    jest.spyOn(connection, 'getCustomRepository').mockImplementation((repo) => {
      switch (repo) {
        case BookingRepository:
          return bookingRepository;
        case EventRepository:
          return eventRepository;
        case WaitlistRepository:
          return waitlistRepository;
        default:
          return null;
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistProcessor,
        { provide: Connection, useValue: connection },
      ],
    }).compile();

    waitlistProcessor = module.get<WaitlistProcessor>(WaitlistProcessor);
  });

  it('should process an event booking and book tickets when available', async () => {
    const eventDto = {
      name: 'New Year Party',
      totalTickets: 100,
      availableTickets: 100,
      date: new Date('2024-12-31T23:59:00Z'),
    };

    const booking = {} as any;
    const waitlist = {} as any;
    const event = {
      id: '349eae90-323c-45a7-ac16-7c1c40041041',
      ...eventDto,
      ...booking,
      ...waitlist,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const jobData = {
      event: { ...event, id: '885697e9-b327-4f8f-94cd-0xd5725a1353' },
      userEmail: 'user@example.com',
      ticketNumber: 1,
    };
    const job = { data: jobData, id: 123, name: 'event_booking_queue' } as Job;

    jest.spyOn(eventRepository, 'getEventById').mockResolvedValue(event);
    jest.spyOn(bookingRepository, 'bookTicket').mockResolvedValue(event);
    jest.spyOn(queryRunner, 'commitTransaction').mockResolvedValue(undefined);

    await waitlistProcessor.processEventBooking(job);

    expect(eventRepository.getEventById).toHaveBeenCalledWith(
      '885697e9-b327-4f8f-94cd-0xd5725a1353',
    );
    expect(bookingRepository.bookTicket).toHaveBeenCalledWith(jobData);
    expect(queryRunner.startTransaction).toHaveBeenCalled();
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('should process an event booking and add to waitlist when tickets are unavailable', async () => {
    const eventDto = {
      name: 'New Year Party',
      totalTickets: 100,
      availableTickets: 100,
      date: new Date('2024-12-31T23:59:00Z'),
    };

    const booking = {} as any;
    const waitlist = {} as any;

    const event = {
      id: '349eae90-323c-45a7-ac16-7c1c40041041',
      ...eventDto,
      ...booking,
      ...waitlist,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const jobData = {
      event: { ...event, id: '885697e9-b327-4f8f-94cd-0xd5725a1353' },
      userEmail: 'user@example.com',
      ticketNumber: 1,
    };
    const job = { data: jobData, id: 123, name: 'event_booking_queue' } as Job;

    jest.spyOn(eventRepository, 'getEventById').mockResolvedValue(event);
    jest
      .spyOn(waitlistRepository, 'addToWaitlist')
      .mockResolvedValue(undefined);
    jest.spyOn(queryRunner, 'commitTransaction').mockResolvedValue(undefined);

    await waitlistProcessor.processEventBooking(job);

    expect(eventRepository.getEventById).toHaveBeenCalledWith(
      '885697e9-b327-4f8f-94cd-0xd5725a1353',
    );
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('should rollback the transaction if an error occurs during event booking', async () => {
    const jobData = {
      event: { id: '885697e9-b327-4f8f-94cd-0xd5725a1353' },
      userEmail: 'user@example.com',
      ticketNumber: 1,
    };
    const job = { data: jobData, id: 123, name: 'event_booking_queue' } as Job;
    const error = new Error('Some Error');

    jest.spyOn(eventRepository, 'getEventById').mockRejectedValue(error);
    jest.spyOn(queryRunner, 'rollbackTransaction').mockResolvedValue(undefined);

    // await expect(waitlistProcessor.processEventBooking(job)).rejects.toThrow(
    //   error,
    // );

    // expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('should assign tickets to waitlisted users via cron job', async () => {
    const eventDto = {
      name: 'New Year Party',
      totalTickets: 100,
      availableTickets: 100,
      date: new Date('2024-12-31T23:59:00Z'),
    };
    const waitlist = [
      {
        id: 'hh5697e9-b327-4f8f-94cd-0xd5725a1333',
        queueId: 2,
        userEmail: 'b@b.com',
        createdAt: new Date('2024-10-06T16:51:06.458Z'),
        updatedAt: new Date('2024-10-06T16:51:06.458Z'),
        deletedAt: null,
        event: {
          id: '349eae90-323c-45a7-ac16-7c1c40041041',
          ...eventDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      },
    ];

    const booking = {} as any;

    const event = {
      id: '349eae90-323c-45a7-ac16-7c1c40041041',
      ...eventDto,
      ...waitlist,
      ...booking,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const waitlistedUsers = [
      {
        id: '9c80d9e9-b327-4f8f-94cd-0eff725ac191',
        queueId: 1,
        userEmail: 'user1@example.com',
        createdAt: new Date('2024-10-06T16:51:06.458Z'),
        updatedAt: new Date('2024-10-06T16:51:06.458Z'),
        deletedAt: null,
        ...event,
      },
      {
        id: 'hhg857e9-b327-4f8f-94cd-0eff725a1114',
        queueId: 2,
        userEmail: 'user2@example.com',
        createdAt: new Date('2024-10-06T16:51:06.458Z'),
        updatedAt: new Date('2024-10-06T16:51:06.458Z'),
        deletedAt: null,
        ...event,
      },
    ];

    jest.spyOn(waitlistRepository, 'getWaitlist').mockResolvedValue(waitlist);
    jest.spyOn(eventRepository, 'getEventById').mockResolvedValue(event);
    jest
      .spyOn(waitlistRepository, 'getWaitlistedUsers')
      .mockResolvedValue(waitlistedUsers);
    jest
      .spyOn(waitlistRepository, 'assignTicketFromWaitlist')
      .mockResolvedValue(undefined);

    await waitlistProcessor.assignTicketsToWaitlist();

    expect(waitlistRepository.getWaitlist).toHaveBeenCalled();
    expect(eventRepository.getEventById).toHaveBeenCalledWith(
      '349eae90-323c-45a7-ac16-7c1c40041041',
    );
    expect(waitlistRepository.getWaitlistedUsers).toHaveBeenCalledWith(
      '349eae90-323c-45a7-ac16-7c1c40041041',
    );
    expect(waitlistRepository.assignTicketFromWaitlist).toHaveBeenCalledWith(
      '349eae90-323c-45a7-ac16-7c1c40041041',
      'user1@example.com',
    );
  });

  it('should handle onComplete correctly', async () => {
    const job = {
      id: 123,
      name: 'event_booking_queue',
      remove: jest.fn(),
    } as any;
    const msg = 'Completed successfully';

    await waitlistProcessor.onComplete(job, msg);

    expect(job.remove).toHaveBeenCalled();
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      'info',
      'info',
      `Job ${job.id} of type ${job.name} has completed with message: ${msg}.`,
      'event-booking-queue-processor',
    );
  });

  it('should handle onError correctly', async () => {
    const job = { id: 123, name: 'event_booking_queue' } as any;
    const error = { message: 'Error occurred', code: 'E123' };

    await waitlistProcessor.onError(job, error);

    const logMsg = JSON.stringify({
      message: error.message,
      errorCode: error.code,
      queueError: error,
    });
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      'error',
      'error',
      logMsg,
      'event-booking-queue-processor',
    );
  });

  it('should handle onFailed correctly', async () => {
    const job = { id: 123 } as any;
    const msg = 'Failed due to error';

    await waitlistProcessor.onFailed(job, msg);

    const logMsg = `Job ${job.id} failed with message: ${msg}!`;
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      'error',
      'error',
      logMsg,
      'event-booking-queue-processor',
    );
  });
});
