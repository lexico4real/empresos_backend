import { Injectable, Req } from '@nestjs/common';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import Logger from '../../config/log4js/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { WaitlistRepository } from './waitlist.repository';
import { Request } from 'express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class WaitlistService {
  logger: Logger = new Logger();

  constructor(
    @InjectRepository(WaitlistRepository)
    private waitlistRepository: WaitlistRepository,
    @InjectQueue('event_booking_queue')
    private bulkUserCreationQueue: Queue,
  ) {}

  async addToWaitlist(createWaitlistDto: CreateWaitlistDto) {
    const result = await this.waitlistRepository.addToWaitlist(
      createWaitlistDto,
    );
    await this.bulkUserCreationQueue.add('event_booking_queue', {
      data: result,
      id: result.id,
    });
    return result;
  }

  async getAllWaitlistSpots(
    page?: number,
    perPage?: number,
    search?: string,
    @Req() req?: Request,
  ): Promise<CreateWaitlistDto[]> {
    return await this.waitlistRepository.getAllWaitlistSpots(
      page,
      perPage,
      search,
      req,
    );
  }

  async getBookingsAndWaitlist(
    page?: number,
    perPage?: number,
    eventId?: string,
    @Req() req?: Request,
  ): Promise<CreateWaitlistDto[]> {
    return await this.waitlistRepository.getBookingsAndWaitlist(
      page,
      perPage,
      eventId,
      req,
    );
  }

  async getWaitlistSpotById(id: string): Promise<any> {
    return await this.waitlistRepository.getWaitlistSpotById(id);
  }

  async deleteWaitlistSpot(id: string): Promise<void> {
    const waitlist = await this.waitlistRepository.getWaitlistSpotById(id);
    return await this.waitlistRepository.deleteWaitlistSpot(waitlist);
  }

  // await this.bulkUserCreationQueue.add('bulk_user_creation', {
  //     dataArray: result,
  //     id: data.id,
  //     createdBy: loggedInUser.email,
  //   });
}
