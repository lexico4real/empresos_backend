import { EntityRepository, Repository, FindManyOptions, ILike } from 'typeorm';
import { Request } from 'express';
import { HttpException, HttpStatus, Req } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './event.entity';
import { UpdateEventDto } from './dto/update-event.dto';
import Logger from '../../config/log4js/logger';
import { generatePagination } from '../../common/util/pagination';
import { customResponse } from '../../common/response';
import { ResponseType as Response } from '../../common/response/response.enum';

@EntityRepository(Event)
export class EventRepository extends Repository<Event> {
  logger: Logger = new Logger();

  // todo - add close date
  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    try {
      createEventDto.totalTickets = createEventDto.availableTickets;
      const event = this.create(createEventDto);
      return await this.save(event);
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        customResponse({
          responseType: Response.CONFLICT,
          partMsg: createEventDto.name,
          error: error.message,
          logName: 'event-repository',
          logType: 'error',
        });
      } else {
        customResponse({
          responseType: Response.INTERNAL_SERVER_ERROR,
          error: error.message,
          logName: 'event-repository',
          logType: 'error',
        });
      }
    }
  }

  async getAllEvents(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<Event[] | any> {
    try {
      const skip = (page - 1) * perPage;

      const where: FindManyOptions<Event>['where'] = search
        ? [{ name: ILike(`%${search}%`) }]
        : undefined;

      const [result, total] = await this.findAndCount({
        where,
        order: { name: 'DESC' },
        skip,
        take: perPage,
      });

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'event-repository',
        logType: 'error',
      });
    }
  }

  async getEventById(id: string): Promise<Event> {
    const isUuid = isUUID(id);
    if (!isUuid) {
      customResponse({
        responseType: Response.BAD_REQUEST,
        partMsg: 'Invalid event ID',
      });
    }
    try {
      const query = this.createQueryBuilder('event');
      query.where('event.id = :id', { id });
      const event = await query.getOne();
      if (!event) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: `E_NOT_F`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return event;
    } catch (error) {
      if (error.message === 'E_NOT_F') {
        customResponse({
          responseType: Response.NOT_FOUND,
          partMsg: id,
          error: error.message,
          logName: 'event-repository',
          logType: 'error',
        });
      } else {
        customResponse({
          responseType: Response.INTERNAL_SERVER_ERROR,
          error: error.message,
          logName: 'event-repository',
          logType: 'error',
        });
      }
    }
  }

  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const { name, totalTickets, availableTickets } = updateEventDto;
    const event = await this.getEventById(id);
    try {
      if (name) event.name = name;
      if (totalTickets) event.totalTickets = totalTickets;
      if (availableTickets) event.availableTickets = availableTickets;
      event.updatedAt = new Date();

      await this.createQueryBuilder()
        .update(Event)
        .set({
          name: event.name,
          totalTickets: event.totalTickets,
          availableTickets: event.availableTickets,
          updatedAt: event.updatedAt,
        })
        .where('id = :id', { id })
        .execute();
    } catch (error) {
      if (
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        customResponse({
          responseType: Response.CONFLICT,
          error: error.message,
          logName: 'event-repository',
          logType: 'error',
        });
      } else {
        customResponse({
          responseType: Response.INTERNAL_SERVER_ERROR,
          error: error.message,
          logName: 'event-repository',
          logType: 'error',
        });
      }
    }
    return event;
  }

  async softDeleteEvent(event: Event): Promise<void> {
    if (!event) {
      customResponse({
        responseType: Response.NOT_FOUND,
        partMsg: 'Event',
      });
    }
    event.deletedAt = new Date();
    await this.save(event);
    customResponse({
      responseType: Response.NO_CONTENT,
    });
  }

  async restoreEvent(event: Event): Promise<void> {
    if (!event || event.deletedAt === null) {
      customResponse({
        responseType: Response.NOT_FOUND,
        partMsg: 'Event',
      });
    }
    event.deletedAt = null;
    await this.save(event);
    throw new HttpException(
      { statuscode: HttpStatus.FOUND, message: `"${event.name}" restored` },
      HttpStatus.FOUND,
    );
  }

  async findOneWithDeleted(id: string): Promise<Event> {
    return await this.findOne({ id }, { withDeleted: true });
  }

  async findWithDeleted(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<any> {
    try {
      const skip = (page - 1) * perPage;

      const where: FindManyOptions<Event>['where'] = search
        ? [{ name: ILike(`%${search}%`) }]
        : undefined;

      const [result, total] = await this.findAndCount({
        where,
        withDeleted: true,
        order: { name: 'DESC' },
        skip,
        take: perPage,
      });

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'event-repository',
        logType: 'error',
      });
    }
  }

  async deletePermanently(event: Event): Promise<void> {
    if (!event) {
      customResponse({
        responseType: Response.NOT_FOUND,
        partMsg: 'Event',
      });
    }
    await this.remove(event);
    customResponse({
      responseType: Response.NO_CONTENT,
    });
  }
}
