import { Injectable, Req } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import Logger from '../../config/log4js/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingRepository } from './booking.repository';
import { Request } from 'express';

@Injectable()
export class BookingService {
  logger: Logger = new Logger();

  constructor(
    @InjectRepository(BookingRepository)
    private bookingRepository: BookingRepository,
  ) {}

  async bookTicket(createBookingDto: CreateBookingDto) {
    return await this.bookingRepository.bookTicket(createBookingDto);
  }

  async getAllBookings(
    page?: number,
    perPage?: number,
    search?: string,
    @Req() req?: Request,
  ): Promise<CreateBookingDto[]> {
    return await this.bookingRepository.getAllBookings(
      page,
      perPage,
      search,
      req,
    );
  }

  async getBookingById(id: string): Promise<any> {
    return await this.bookingRepository.getBookingById(id);
  }

  async cancelBooking(id: string): Promise<void> {
    const booking = await this.getBookingById(id);
    return await this.bookingRepository.cancelBooking(booking);
  }
}
