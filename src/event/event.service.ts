import { Injectable, Req } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import Logger from '../../config/log4js/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { EventRepository } from './event.repository';
import { Request } from 'express';
import { Event } from './event.entity';

@Injectable()
export class EventService {
  logger: Logger = new Logger();

  constructor(
    @InjectRepository(EventRepository)
    private eventRepository: EventRepository,
  ) {}

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    return await this.eventRepository.createEvent(createEventDto);
  }

  async getAllEvents(
    page?: number,
    perPage?: number,
    search?: string,
    @Req() req?: Request,
  ): Promise<any[]> {
    return await this.eventRepository.getAllEvents(page, perPage, search, req);
  }

  async getEventById(id: string): Promise<Event> {
    return await this.eventRepository.getEventById(id);
  }

  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return await this.eventRepository.updateEvent(id, updateEventDto);
  }

  async softDeleteEvent(id: string): Promise<any> {
    const event = await this.eventRepository.findOne(id);
    return await this.eventRepository.softDeleteEvent(event);
  }

  async restoreEvent(id: string): Promise<void> {
    const event = await this.eventRepository.findOneWithDeleted(id);
    await this.eventRepository.restoreEvent(event);
  }

  async deleteEvent(id: string): Promise<void> {
    const event = await this.eventRepository.findOneWithDeleted(id);
    if (event && event.deletedAt === null) {
      return await this.eventRepository.softDeleteEvent(event);
    } else {
      return await this.eventRepository.deletePermanently(event);
    }
  }

  async getDeletedEvent(
    page?: number,
    perPage?: number,
    search?: string,
    @Req() req?: Request,
  ): Promise<any> {
    return await this.eventRepository.findWithDeleted(
      page,
      perPage,
      search,
      req,
    );
  }
}
