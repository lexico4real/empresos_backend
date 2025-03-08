import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/role.enum';

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}
  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  getAllEvents(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    return this.eventService.getAllEvents(page, perPage, search, req);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Roles(Role.Super_Admin)
  @Post('initialize')
  createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventService.createEvent(createEventDto);
  }

  @Get(':id')
  getEventById(@Param('id') id: string) {
    return this.eventService.getEventById(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Roles(Role.Super_Admin)
  @Patch(':id')
  updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.updateEvent(id, updateEventDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Roles(Role.Super_Admin, Role.Admin)
  @Delete(':id')
  softDeleteEvent(@Param('id') id: string) {
    return this.eventService.softDeleteEvent(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Roles(Role.Super_Admin)
  @Delete('auth/:id')
  deleteEvent(@Param('id') id: string) {
    return this.eventService.deleteEvent(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @Roles(Role.Super_Admin)
  @Get('restore/:id')
  restoreEvent(@Param('id') id: string) {
    return this.eventService.restoreEvent(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Roles(Role.Super_Admin, Role.Admin)
  @Get('auth/with-deleted')
  getDeletedEvent(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('search') search: string,
    @Req() req: Request,
  ) {
    return this.eventService.getDeletedEvent(page, perPage, search, req);
  }
}
