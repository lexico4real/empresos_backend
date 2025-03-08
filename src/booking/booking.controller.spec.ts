import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Request } from 'express';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';

describe('BookingController', () => {
  let bookingController: BookingController;
  let bookingService: BookingService;
  let bookingRepository: BookingRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: 'secret' }),
      ],
      controllers: [BookingController],
      providers: [
        BookingService,
        {
          provide: BookingRepository,
          useValue: {
            getAllBookings: jest.fn(),
            getBookingById: jest.fn(),
            bookTicket: jest.fn(),
            cancelBooking: jest.fn(),
          },
        },
      ],
    }).compile();

    bookingController = module.get<BookingController>(BookingController);
    bookingService = module.get<BookingService>(BookingService);
    bookingRepository = module.get<BookingRepository>(BookingRepository);
  });

  it('should call getAllBookings with the correct parameters', async () => {
    const mockRequest = {} as Request;
    const mockBookings = [
      {
        id: '351a3350-01ee-4a83-80d4-17dc5b4f5c76',
        createdAt: new Date('2024-10-05T00:28:33.554Z'),
        updatedAt: new Date('2024-10-05T00:28:33.554Z'),
        deletedAt: null,
        eventId: '9c80d9e9-b327-4f8f-94cd-0eff725ac191',
        userEmail: 'olu@gmail.com',
        ticketNumber: 787586,
      },
      {
        id: '351a3350-01ee-4a83-80d4-17dc5b4f5c76',
        createdAt: new Date('2024-10-05T00:28:33.554Z'),
        updatedAt: new Date('2024-10-05T00:28:33.554Z'),
        deletedAt: null,
        eventId: '9c80d9e9-b327-4f8f-94cd-0eff725ac191',
        userEmail: 'olu2@gmail.com',
        ticketNumber: 2,
      },
    ];
    const page = 1;
    const perPage = 10;
    const search = 'test';

    jest
      .spyOn(bookingRepository, 'getAllBookings')
      .mockResolvedValue(mockBookings);
    jest
      .spyOn(bookingService, 'getAllBookings')
      .mockResolvedValue(mockBookings);

    const result = await bookingController.getAllBookings(
      page,
      perPage,
      search,
      mockRequest,
    );

    expect(bookingService.getAllBookings).toHaveBeenCalledWith(
      page,
      perPage,
      search,
      mockRequest,
    );
    expect(result).toEqual(mockBookings);

    jest.clearAllMocks();
  });

  it('should handle service errors gracefully', async () => {
    const mockRequest = {} as Request;
    const page = 1;
    const perPage = 10;
    const search = 'test';

    jest
      .spyOn(bookingService, 'getAllBookings')
      .mockRejectedValue(new Error('Service error'));

    try {
      await bookingController.getAllBookings(
        page,
        perPage,
        search,
        mockRequest,
      );
    } catch (error) {
      expect(error.message).toBe('Service error');
    }

    expect(bookingService.getAllBookings).toHaveBeenCalledWith(
      page,
      perPage,
      search,
      mockRequest,
    );

    jest.clearAllMocks();
  });

  it('should return an booking when a valid ID is provided', async () => {
    const event = {} as any;
    const mockBooking = {
      id: '351a3350-01ee-4a83-80d4-17dc5b4f5c76',
      createdAt: new Date('2024-10-05T00:28:33.554Z'),
      updatedAt: new Date('2024-10-05T00:28:33.554Z'),
      deletedAt: null,
      eventId: '9c80d9e9-b327-4f8f-94cd-0eff725ac191',
      userEmail: 'olu@gmail.com',
      ticketNumber: 787586,
      ...event,
    };

    jest
      .spyOn(bookingRepository, 'getBookingById')
      .mockResolvedValue(mockBooking);
    jest.spyOn(bookingService, 'getBookingById').mockResolvedValue(mockBooking);

    const result = await bookingController.getBookingById(mockBooking.id);

    expect(bookingService.getBookingById).toHaveBeenCalledWith(mockBooking.id);
    expect(result).toEqual(mockBooking);

    jest.clearAllMocks();
  });

  it('should call bookTicket with the correct parameters and return the created booking', async () => {
    const bookTicketDto = {
      ticketNumber: 787586,
      eventId: '9c80d9e9-b327-4f8f-94cd-0eff725ac191',
      userEmail: 'olu@gmail.com',
    };

    const event = {} as any;

    const mockCreatedBooking = {
      id: '349eae90-323c-45a7-ac16-7c1c40041041',
      ...bookTicketDto,
      ...event,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    jest
      .spyOn(bookingService, 'bookTicket')
      .mockResolvedValue(mockCreatedBooking);

    const result = await bookingController.bookTicket(bookTicketDto);

    expect(bookingService.bookTicket).toHaveBeenCalledWith(bookTicketDto);
    expect(result).toEqual(mockCreatedBooking);

    jest.clearAllMocks();
  });

  it('should handle service errors gracefully', async () => {
    const bookTicketDto = {
      ticketNumber: 787586,
      eventId: '9c80d9e9-b327-4f8f-94cd-0eff725ac191',
      userEmail: 'olu@gmail.com',
    };

    const mockError = new Error('Unable to create booking');

    jest.spyOn(bookingService, 'bookTicket').mockRejectedValue(mockError);

    try {
      await bookingController.bookTicket(bookTicketDto);
    } catch (error) {
      expect(error).toBe(mockError);
    }

    expect(bookingService.bookTicket).toHaveBeenCalledWith(bookTicketDto);

    jest.clearAllMocks();
  });

  it('should call cancelBooking with the correct id and return the result', async () => {
    const bookingId = '9c80d9e9-b327-4f8f-94cd-0eff725ac191';
    const mockResult = null;

    jest.spyOn(bookingService, 'cancelBooking').mockResolvedValue(mockResult);

    const result = await bookingController.cancelBooking(bookingId);

    expect(bookingService.cancelBooking).toHaveBeenCalledWith(bookingId);
    expect(result).toEqual(mockResult);

    jest.clearAllMocks();
  });

  it('should handle service errors gracefully', async () => {
    const bookingId = '9c80d9e9-b327-4f8f-94cd-0eff725ac191';
    const mockError = new Error('Unable to cancle booking');

    jest.spyOn(bookingService, 'cancelBooking').mockRejectedValue(mockError);

    try {
      await bookingController.cancelBooking(bookingId);
    } catch (error) {
      expect(error).toBe(mockError);
    }

    expect(bookingService.cancelBooking).toHaveBeenCalledWith(bookingId);

    jest.clearAllMocks();
  });
});
