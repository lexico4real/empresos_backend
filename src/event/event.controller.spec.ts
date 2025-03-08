import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Request } from 'express';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';

describe('EventController', () => {
  let eventController: EventController;
  let eventService: EventService;
  let eventRepository: EventRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: 'secret' }),
      ],
      controllers: [EventController],
      providers: [
        EventService,
        {
          provide: EventRepository,
          useValue: {
            getAllEvents: jest.fn(),
            getEventById: jest.fn(),
            createEvent: jest.fn(),
            updateEvent: jest.fn(),
            softDeleteEvent: jest.fn(),
            deleteEvent: jest.fn(),
            restoreEvent: jest.fn(),
            getDeletedEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    eventController = module.get<EventController>(EventController);
    eventService = module.get<EventService>(EventService);
    eventRepository = module.get<EventRepository>(EventRepository);
  });

  it('should call getAllEvents with the correct parameters', async () => {
    const mockRequest = {} as Request;
    const mockEvents = [
      {
        id: '9c80d9e9-b327-4f8f-94cd-0eff725ac191',
        createdAt: new Date('2024-10-05T00:28:33.554Z'),
        updatedAt: new Date('2024-10-06T16:51:06.458Z'),
        deletedAt: null,
        name: 'Event 1',
        totalTickets: 5,
        availableTickets: 4,
      },
      {
        id: '9c80d9e9-b327-4f8f-94cd-0eff725ac192',
        createdAt: new Date('2024-10-05T00:28:33.554Z'),
        updatedAt: new Date('2024-10-06T16:51:06.458Z'),
        deletedAt: null,
        name: 'Event 2',
        totalTickets: 5,
        availableTickets: 4,
      },
    ];
    const page = 1;
    const perPage = 10;
    const search = 'test';

    jest.spyOn(eventRepository, 'getAllEvents').mockResolvedValue(mockEvents);
    jest.spyOn(eventService, 'getAllEvents').mockResolvedValue(mockEvents);

    const result = await eventController.getAllEvents(
      page,
      perPage,
      search,
      mockRequest,
    );

    expect(eventService.getAllEvents).toHaveBeenCalledWith(
      page,
      perPage,
      search,
      mockRequest,
    );
    expect(result).toEqual(mockEvents);

    jest.clearAllMocks();
  });

  it('should handle service errors gracefully', async () => {
    const mockRequest = {} as Request;
    const page = 1;
    const perPage = 10;
    const search = 'test';

    jest
      .spyOn(eventService, 'getAllEvents')
      .mockRejectedValue(new Error('Service error'));

    try {
      await eventController.getAllEvents(page, perPage, search, mockRequest);
    } catch (error) {
      expect(error.message).toBe('Service error');
    }

    expect(eventService.getAllEvents).toHaveBeenCalledWith(
      page,
      perPage,
      search,
      mockRequest,
    );

    jest.clearAllMocks();
  });

  it('should return an event when a valid ID is provided', async () => {
    const booking = {} as any;
    const waitlist = {} as any;

    const mockEvent = {
      id: '9c80d9e9-b327-4f8f-94cd-0eff725ac191',
      createdAt: new Date('2024-10-05T00:28:33.554Z'),
      updatedAt: new Date('2024-10-06T16:51:06.458Z'),
      deletedAt: null,
      name: 'Obudu Resort Party2',
      totalTickets: 5,
      availableTickets: 4,
      ...booking,
      waitlist,
    };

    jest.spyOn(eventRepository, 'getEventById').mockResolvedValue(mockEvent);
    jest.spyOn(eventService, 'getEventById').mockResolvedValue(mockEvent);

    const result = await eventController.getEventById(mockEvent.id);

    expect(eventService.getEventById).toHaveBeenCalledWith(mockEvent.id);
    expect(result).toEqual(mockEvent);

    jest.clearAllMocks();
  });

  it('should call createEvent with the correct parameters and return the created event', async () => {
    const createEventDto = {
      name: 'New Year Party',
      totalTickets: 100,
      availableTickets: 100,
      date: new Date('2024-12-31T23:59:00Z'),
    };

    const booking = {} as any;
    const waitlist = {} as any;

    const mockCreatedEvent = {
      id: '349eae90-323c-45a7-ac16-7c1c40041041',
      ...createEventDto,
      ...booking,
      ...waitlist,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    jest.spyOn(eventService, 'createEvent').mockResolvedValue(mockCreatedEvent);

    const result = await eventController.createEvent(createEventDto);

    expect(eventService.createEvent).toHaveBeenCalledWith(createEventDto);
    expect(result).toEqual(mockCreatedEvent);

    jest.clearAllMocks();
  });

  it('should handle service errors gracefully', async () => {
    const createEventDto = {
      name: 'Summer Festival',
      totalTickets: 200,
      availableTickets: 200,
      date: new Date('2024-06-21T18:00:00Z'),
    };

    const mockError = new Error('Unable to create event');

    jest.spyOn(eventService, 'createEvent').mockRejectedValue(mockError);

    try {
      await eventController.createEvent(createEventDto);
    } catch (error) {
      expect(error).toBe(mockError);
    }

    expect(eventService.createEvent).toHaveBeenCalledWith(createEventDto);

    jest.clearAllMocks();
  });

  it('should call updateEvent with the correct parameters and return the updated event', async () => {
    const eventId = '9c80d9e9-b327-4f8f-94cd-0eff725ac191';
    const updateEventDto = {
      name: 'Updated Event Name',
      totalTickets: 150,
      availableTickets: 100,
      date: new Date('2024-11-15T10:00:00Z'),
    };

    const booking = {} as any;
    const waitlist = {} as any;

    const mockUpdatedEvent = {
      id: eventId,
      ...updateEventDto,
      ...booking,
      ...waitlist,
      createdAt: new Date('2024-10-01T12:00:00Z'),
      updatedAt: new Date(),
      deletedAt: null,
    };

    jest.spyOn(eventService, 'updateEvent').mockResolvedValue(mockUpdatedEvent);

    const result = await eventController.updateEvent(eventId, updateEventDto);

    expect(eventService.updateEvent).toHaveBeenCalledWith(
      eventId,
      updateEventDto,
    );
    expect(result).toEqual(mockUpdatedEvent);

    jest.clearAllMocks();
  });

  it('should handle service errors gracefully', async () => {
    const eventId = '9c80d9e9-b327-4f8f-94cd-0eff725ac191';
    const updateEventDto = {
      name: 'Another Updated Event',
      totalTickets: 50,
      availableTickets: 50,
      date: new Date('2024-12-25T15:00:00Z'),
    };

    const mockError = new Error('Unable to update event');

    jest.spyOn(eventService, 'updateEvent').mockRejectedValue(mockError);

    try {
      await eventController.updateEvent(eventId, updateEventDto);
    } catch (error) {
      expect(error).toBe(mockError);
    }

    expect(eventService.updateEvent).toHaveBeenCalledWith(
      eventId,
      updateEventDto,
    );

    jest.clearAllMocks();
  });

  it('should call softDeleteEvent with the correct id and return the result', async () => {
    const eventId = '9c80d9e9-b327-4f8f-94cd-0eff725ac191';
    const mockResult = { message: 'Event successfully soft deleted' };

    jest.spyOn(eventService, 'softDeleteEvent').mockResolvedValue(mockResult);

    const result = await eventController.softDeleteEvent(eventId);

    expect(eventService.softDeleteEvent).toHaveBeenCalledWith(eventId);
    expect(result).toEqual(mockResult);

    jest.clearAllMocks();
  });

  it('should handle service errors gracefully', async () => {
    const eventId = '9c80d9e9-b327-4f8f-94cd-0eff725ac191';
    const mockError = new Error('Unable to soft delete event');

    jest.spyOn(eventService, 'softDeleteEvent').mockRejectedValue(mockError);

    try {
      await eventController.softDeleteEvent(eventId);
    } catch (error) {
      expect(error).toBe(mockError);
    }

    expect(eventService.softDeleteEvent).toHaveBeenCalledWith(eventId);

    jest.clearAllMocks();
  });

  it('should call deleteEvent with the correct id and return the result', async () => {
    const eventId = '9c80d9e9-b327-4f8f-94cd-0eff725ac191';
    const mockResult = null;

    jest.spyOn(eventService, 'deleteEvent').mockResolvedValue(mockResult);

    const result = await eventController.deleteEvent(eventId);

    expect(eventService.deleteEvent).toHaveBeenCalledWith(eventId);
    expect(result).toEqual(mockResult);

    jest.clearAllMocks();
  });

  it('should handle service errors gracefully', async () => {
    const eventId = '9c80d9e9-b327-4f8f-94cd-0eff725ac191';
    const mockError = new Error('Unable to delete event');

    jest.spyOn(eventService, 'deleteEvent').mockRejectedValue(mockError);

    try {
      await eventController.deleteEvent(eventId);
    } catch (error) {
      expect(error).toBe(mockError);
    }

    expect(eventService.deleteEvent).toHaveBeenCalledWith(eventId);

    jest.clearAllMocks();
  });

  it('should call restoreEvent with the correct id and return the result', async () => {
    const eventId = '9c80d9e9-b327-4f8f-94cd-0eff725ac191';
    const mockResult = null;

    jest.spyOn(eventService, 'restoreEvent').mockResolvedValue(mockResult);

    const result = await eventController.restoreEvent(eventId);

    expect(eventService.restoreEvent).toHaveBeenCalledWith(eventId);
    expect(result).toEqual(mockResult);

    jest.clearAllMocks();
  });

  it('should handle service errors gracefully', async () => {
    const eventId = '9c80d9e9-b327-4f8f-94cd-0eff725ac191';
    const mockError = new Error('Unable to restore event');

    jest.spyOn(eventService, 'restoreEvent').mockRejectedValue(mockError);

    try {
      await eventController.restoreEvent(eventId);
    } catch (error) {
      expect(error).toBe(mockError);
    }

    expect(eventService.restoreEvent).toHaveBeenCalledWith(eventId);

    jest.clearAllMocks();
  });

  it('should call getDeletedEvent with the correct parameters and return the result', async () => {
    const mockRequest = {} as Request;
    const page = 1;
    const perPage = 10;
    const search = 'test';
    const mockDeletedEvents = [
      { id: '1', name: 'Deleted Event 1' },
      { id: '2', name: 'Deleted Event 2' },
    ];

    jest
      .spyOn(eventService, 'getDeletedEvent')
      .mockResolvedValue(mockDeletedEvents);

    const result = await eventController.getDeletedEvent(
      page,
      perPage,
      search,
      mockRequest,
    );

    expect(eventService.getDeletedEvent).toHaveBeenCalledWith(
      page,
      perPage,
      search,
      mockRequest,
    );
    expect(result).toEqual(mockDeletedEvents);

    jest.clearAllMocks();
  });

  it('should handle service errors gracefully', async () => {
    const mockRequest = {} as Request;
    const page = 1;
    const perPage = 10;
    const search = 'test';
    const mockError = new Error('Unable to retrieve deleted events');

    jest.spyOn(eventService, 'getDeletedEvent').mockRejectedValue(mockError);

    try {
      await eventController.getDeletedEvent(page, perPage, search, mockRequest);
    } catch (error) {
      expect(error).toBe(mockError);
    }

    expect(eventService.getDeletedEvent).toHaveBeenCalledWith(
      page,
      perPage,
      search,
      mockRequest,
    );

    jest.clearAllMocks();
  });
});
