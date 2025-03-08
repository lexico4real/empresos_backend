import {
  EntityRepository,
  Repository,
  FindManyOptions,
  ILike,
  Connection,
} from 'typeorm';
import { Request } from 'express';
import { HttpException, HttpStatus, Req } from '@nestjs/common';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { Waitlist } from './waitlist.entity';
import Logger from '../../config/log4js/logger';
import { ResponseType as Response } from '../../common/response/response.enum';
import { customResponse } from '../../common/response';
import { EventRepository } from '../event/event.repository';
import { Event } from '../event/event.entity';
import { Booking } from '../booking/booking.entity';
import { generatePagination } from '../../common/util/pagination';
import { isUUID } from 'class-validator';
import { generateNumber } from '../../common/util/generateNumber';
import { BookingRepository } from '../booking/booking.repository';

@EntityRepository(Waitlist)
export class WaitlistRepository extends Repository<Waitlist> {
  logger: Logger = new Logger();

  private readonly eventRepository: EventRepository;

  private readonly bookingRepository: BookingRepository;

  constructor(private connection: Connection) {
    super();
    this.eventRepository = this.connection.getCustomRepository(EventRepository);
    this.bookingRepository =
      this.connection.getCustomRepository(BookingRepository);
  }

  async addToWaitlist(createWaitlistDto: CreateWaitlistDto): Promise<Waitlist> {
    try {
      const event = await this.eventRepository.getEventById(
        createWaitlistDto.eventId,
      );

      const checkDup = await this.findOne({
        where: { userEmail: createWaitlistDto.userEmail, event },
      });

      if (checkDup) {
        customResponse({
          responseType: Response.CONFLICT,
          partMsg: createWaitlistDto.userEmail,
        });
      }

      if (!event) {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: 'Event ID',
        });
      }

      if (event.availableTickets > 0) {
        customResponse({
          responseType: Response.BAD_REQUEST,
          partMsg: 'WL_CLOSE',
        });
      }
      const waitlist = this.create({ ...createWaitlistDto, event });
      return await this.save(waitlist);
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        customResponse({
          responseType: Response.CONFLICT,
          partMsg: createWaitlistDto.userEmail,
          error,
          logName: 'waitlist-repository',
          logType: 'error',
        });
      } else if (
        error.message === `${createWaitlistDto.userEmail} already exists`
      ) {
        customResponse({
          responseType: Response.CONFLICT,
          partMsg: createWaitlistDto.userEmail,
          error,
          logName: 'waitlist-repository',
          logType: 'error',
        });
      } else if (error.message === 'Event ID not found') {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: 'Event ID',
        });
      } else if (error.message === `${createWaitlistDto.eventId} not found`) {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: createWaitlistDto.eventId,
        });
      } else if (error.message === 'WL_CLOSE') {
        customResponse({
          responseType: Response.BAD_REQUEST,
          partMsg: 'There are still slots left to purchase',
        });
      } else if (error.message === 'Invalid event ID') {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: error.message,
        });
      } else {
        customResponse({
          responseType: Response.INTERNAL_SERVER_ERROR,
          error: error.message,
          logName: 'waitlist-repository',
          logType: 'error',
        });
      }
    }
  }

  async getAllWaitlistSpots(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<Waitlist[] | any> {
    try {
      const skip = (page - 1) * perPage;

      const where: FindManyOptions<Waitlist>['where'] = search
        ? [
            { userEmail: ILike(`%${search}%`) },
            { eventId: ILike(`%${search}%`) },
          ]
        : undefined;

      const [result, total] = await this.findAndCount({
        relations: ['event'],
        where,
        order: { userEmail: 'DESC' },
        skip,
        take: perPage,
      });

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'waitlist-repository',
        logType: 'error',
      });
    }
  }

  async getBookingsAndWaitlist(
    page = 1,
    perPage = 10,
    eventId: string,
    @Req() req: Request,
  ): Promise<any> {
    try {
      const skip = (page - 1) * perPage;

      const [waitlistResult, waitlistTotal] = await this.findAndCount({
        relations: ['event'],
        where: { event: { id: eventId } },
        order: { userEmail: 'DESC' },
        skip,
        take: perPage,
      });

      const [bookingResult, bookingTotal] =
        await this.bookingRepository.findAndCount({
          relations: ['event'],
          where: { event: { id: eventId } },
          order: { userEmail: 'DESC' },
          skip,
          take: perPage,
        });

      const combinedResults = [
        { bookings: bookingResult, waitlist: waitlistResult },
      ];
      const combinedTotal = waitlistTotal + bookingTotal;

      return generatePagination(
        page,
        perPage,
        combinedTotal,
        req,
        combinedResults,
      );
    } catch (error) {
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'booking-waitlist-repository',
        logType: 'error',
      });
    }
  }

  async getWaitlist() {
    return await this.createQueryBuilder('waitlist')
      .leftJoinAndSelect('waitlist.event', 'event')
      .getMany();
  }

  async getWaitlistSpotById(id: string): Promise<Waitlist> {
    const isUuid = isUUID(id);
    if (!isUuid) {
      customResponse({
        responseType: Response.BAD_REQUEST,
        partMsg: id,
      });
    }
    try {
      const query = this.createQueryBuilder('waitlist');
      query.where('waitlist.id = :id', { id });
      const waitlist = await query.getOne();
      if (!waitlist) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: `E_NOT_F`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return waitlist;
    } catch (error) {
      if (error.message === 'E_NOT_F') {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: id,
          error: error.message,
          logName: 'waitlist-repository',
          logType: 'error',
        });
      } else {
        customResponse({
          responseType: Response.INTERNAL_SERVER_ERROR,
          error: error.message,
          logName: 'waitlist-repository',
          logType: 'error',
        });
      }
    }
  }

  async deleteWaitlistSpot(waitlist: Waitlist): Promise<void> {
    if (!waitlist) {
      customResponse({
        responseType: Response.NOT_FOUND,
        partMsg: 'Waitlist',
      });
    }
    await this.remove(waitlist);
    customResponse({
      responseType: Response.NO_CONTENT,
    });
  }

  async getWaitlistedUsers(eventId: string): Promise<Waitlist[]> {
    return await this.createQueryBuilder('waitlist')
      .where('waitlist.eventId = :eventId', { eventId })
      .orderBy('waitlist.createdAt', 'ASC')
      .getMany();
  }

  async assignTicketFromWaitlist(
    eventId: string,
    userEmail: string,
  ): Promise<void> {
    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event = await queryRunner.manager.findOne(Event, eventId);

      if (!event || event.availableTickets <= 0) {
        throw new Error('No tickets available or invalid event.');
      }

      await queryRunner.manager.delete(Waitlist, {
        event: { id: eventId },
        userEmail,
      });

      const booking = new Booking();
      const eventEntity = new Event();
      eventEntity.id = eventId;
      booking.event = eventEntity;
      booking.userEmail = userEmail;
      booking.ticketNumber = Number(generateNumber(6));
      await queryRunner.manager.save(booking);

      event.availableTickets -= 1;
      await queryRunner.manager.save(event);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(
        `Failed to assign ticket from waitlist: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
