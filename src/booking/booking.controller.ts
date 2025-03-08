import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/role.enum';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('booking')
@Controller('book')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // @SkipThrottle({ default: false })
  @Get()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Roles(Role.Super_Admin)
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  getAllBookings(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    return this.bookingService.getAllBookings(page, perPage, search, req);
  }

  @Post()
  bookTicket(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.bookTicket(createBookingDto);
  }

  @Get(':id')
  getBookingById(@Param('id') id: string) {
    return this.bookingService.getBookingById(id);
  }

  @Delete(':id')
  cancelBooking(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }
}
