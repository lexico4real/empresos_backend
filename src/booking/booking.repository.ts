import {
  EntityRepository,
  Repository,
  FindManyOptions,
  ILike,
  Connection,
} from 'typeorm';
import { Request } from 'express';
import { HttpException, HttpStatus, Req } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './booking.entity';
import Logger from '../../config/log4js/logger';
import { ResponseType as Response } from '../../common/response/response.enum';
import { customResponse } from '../../common/response';
import { EventRepository } from '../event/event.repository';
import { Event } from '../event/event.entity';
import { generatePagination } from '../../common/util/pagination';
import { isUUID } from 'class-validator';
import { EventStatus } from '../event/event-status.enum';

@EntityRepository(Booking)
export class BookingRepository extends Repository<Booking> {
  logger: Logger = new Logger();
  private readonly eventRepository: EventRepository;

  constructor(private connection: Connection) {
    super();
    this.eventRepository = this.connection.getCustomRepository(EventRepository);
  }

  async bookTicket(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { eventId, userEmail } = createBookingDto;
    try {
      const event = await this.eventRepository.getEventById(eventId);
      if (!event) {
        customResponse({
          responseType: Response.NOT_FOUND,
        });
      }

      const checkDup = await this.findOne({ where: { userEmail, event } });

      if (checkDup) {
        customResponse({
          responseType: Response.CONFLICT,
          partMsg: createBookingDto.userEmail,
        });
      }

      const { availableTickets, totalTickets } = event;

      if (availableTickets <= 0) {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: 'Ticket',
        });
      }

      const avTickets = availableTickets - 1;

      const ticketNumber = totalTickets - availableTickets + 1;

      const status = avTickets === 0 ? EventStatus.CLOSE : EventStatus.OPEN;

      await this.eventRepository
        .createQueryBuilder()
        .update(Event)
        .set({ availableTickets: avTickets, status })
        .where('id = :id', { id: eventId })
        .execute();

      createBookingDto.ticketNumber = ticketNumber;
      const booking = this.create({ ...createBookingDto, event });
      return await this.save(booking);
    } catch (error) {
      if (
        error.message.includes(
          'duplicate key value violates unique constraint',
        ) ||
        error.message === `${createBookingDto.userEmail} already exists`
      ) {
        customResponse({
          responseType: Response.CONFLICT,
          partMsg: createBookingDto.userEmail,
          error: error.message,
          logName: 'booking-repository',
          logType: 'error',
        });
      } else if (error.message === `${createBookingDto.eventId} not found`) {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: createBookingDto.eventId,
        });
      } else if (error.message === 'Ticket not found') {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: 'Ticket',
        });
      } else {
        customResponse({
          responseType: Response.INTERNAL_SERVER_ERROR,
          error: error,
          logName: 'booking-repository',
          logType: 'error',
        });
      }
    }
  }

  async getAllBookings(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<Booking[] | any> {
    try {
      const skip = (page - 1) * perPage;

      const where: FindManyOptions<Booking>['where'] = search
        ? [{ userEmail: ILike(`%${search}%`) }]
        : undefined;

      const [result, total] = await this.findAndCount({
        where,
        relations: ['event'],
        order: { ticketNumber: 'ASC' },
        skip,
        take: perPage,
      });

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'booking-repository',
        logType: 'error',
      });
    }
  }

  async getBookingById(id: string): Promise<Booking> {
    const isUuid = isUUID(id);
    if (!isUuid) {
      customResponse({
        responseType: Response.BAD_REQUEST,
        partMsg: id,
      });
    }
    try {
      const query = this.createQueryBuilder('booking')
        .leftJoinAndSelect('booking.event', 'event')
        .where('booking.id = :id', { id });
      const booking = await query.getOne();
      if (!booking) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: `E_NOT_F`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return booking;
    } catch (error) {
      if (error.message === 'E_NOT_F') {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: id,
          error: error.message,
          logName: 'booking-repository',
          logType: 'error',
        });
      } else {
        customResponse({
          responseType: Response.INTERNAL_SERVER_ERROR,
          error: error.message,
          logName: 'booking-repository',
          logType: 'error',
        });
      }
    }
  }

  async cancelBooking(booking: Booking): Promise<void> {
    if (!booking) {
      customResponse({
        responseType: Response.NOT_FOUND,
        partMsg: 'Booking',
      });
    }
    const event = await this.eventRepository.getEventById(booking.event.id);
    const { name, totalTickets, availableTickets } = event;
    await this.eventRepository
      .createQueryBuilder()
      .update(Event)
      .set({ availableTickets: availableTickets + 1, totalTickets, name })
      .where('id = :id', { id: event.id })
      .execute();
    await this.remove(booking);
    customResponse({
      responseType: Response.NO_CONTENT,
    });
  }
}
