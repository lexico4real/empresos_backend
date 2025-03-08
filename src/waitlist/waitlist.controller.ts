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
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/role.enum';

@ApiTags('waitlists')
@Controller('waitlists')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}
  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  getAllWaitlistSpots(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    return this.waitlistService.getAllWaitlistSpots(page, perPage, search, req);
  }

  @Post()
  addToWaitlist(@Body() createWaitlistDto: CreateWaitlistDto) {
    return this.waitlistService.addToWaitlist(createWaitlistDto);
  }

  @Get(':id')
  getWaitlistSpotById(@Param('id') id: string) {
    return this.waitlistService.getWaitlistSpotById(id);
  }

  @Get('status/:eventId')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  getBookingsAndWaitlist(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Param('eventId') eventId: string,
    @Req() req: Request,
  ) {
    return this.waitlistService.getBookingsAndWaitlist(
      page,
      perPage,
      eventId,
      req,
    );
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Roles(Role.Super_Admin)
  @Delete('auth/:id')
  deleteWaitlist(@Param('id') id: string) {
    return this.waitlistService.deleteWaitlistSpot(id);
  }
}
