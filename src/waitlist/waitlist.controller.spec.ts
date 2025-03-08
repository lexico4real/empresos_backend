import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Request } from 'express';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';

describe('WaitlistController - getAllWaitlistSpots', () => {
  let waitlistController: WaitlistController;
  let waitlistService: WaitlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: 'secret' }),
      ],
      controllers: [WaitlistController],
      providers: [
        {
          provide: WaitlistService,
          useValue: {
            getAllWaitlistSpots: jest.fn(),
            addToWaitlist: jest.fn(),
            getWaitlistSpotById: jest.fn(),
            deleteWaitlistSpot: jest.fn(),
          },
        },
      ],
    }).compile();

    waitlistController = module.get<WaitlistController>(WaitlistController);
    waitlistService = module.get<WaitlistService>(WaitlistService);
  });

  it('should call getAllWaitlistSpots with the correct parameters and return waitlist spots', async () => {
    const mockRequest = {} as Request;
    const page = 1;
    const perPage = 10;
    const search = 'test';
    const mockWaitlistSpots = [
      {
        id: '9c80d9e9-b327-4f8f-94cd-0eff725ac191',
        queueId: '1',
        eventId: '2367d9e9-b327-4f8f-94cd-0eff725ah563',
        userEmail: 'a@a.com',
        createdAt: new Date('2024-10-06T16:51:06.458Z'),
        updatedAt: new Date('2024-10-06T16:51:06.458Z'),
        deletedAt: null,
      },
      {
        id: 'hhg857e9-b327-4f8f-94cd-0eff725a1114',
        queueId: '2',
        eventId: '2367d9e9-b327-4f8f-94cd-0eff725ah563',
        userEmail: 'b@b.com',
        createdAt: new Date('2024-10-06T16:51:06.458Z'),
        updatedAt: new Date('2024-10-06T16:51:06.458Z'),
        deletedAt: null,
      },
    ];

    jest
      .spyOn(waitlistService, 'getAllWaitlistSpots')
      .mockResolvedValue(mockWaitlistSpots);

    const result = await waitlistController.getAllWaitlistSpots(
      page,
      perPage,
      search,
      mockRequest,
    );

    expect(waitlistService.getAllWaitlistSpots).toHaveBeenCalledWith(
      page,
      perPage,
      search,
      mockRequest,
    );
    expect(result).toEqual(mockWaitlistSpots);

    jest.clearAllMocks();
  });

  it('should handle service errors gracefully', async () => {
    const mockRequest = {} as Request;
    const page = 1;
    const perPage = 10;
    const search = 'test';
    const mockError = new Error('Service error');

    jest
      .spyOn(waitlistService, 'getAllWaitlistSpots')
      .mockRejectedValue(mockError);

    await expect(
      waitlistController.getAllWaitlistSpots(
        page,
        perPage,
        search,
        mockRequest,
      ),
    ).rejects.toThrow(mockError);

    expect(waitlistService.getAllWaitlistSpots).toHaveBeenCalledWith(
      page,
      perPage,
      search,
      mockRequest,
    );

    jest.clearAllMocks();
  });

  it('should call addToWaitlist with correct parameters', async () => {
    const event = {} as any;
    const createWaitlistDto = {
      id: '9c80d9e9-b327-4f8f-94cd-0eff725ac191',
      queueId: 1,
      eventId: '2367d9e9-b327-4f8f-94cd-0eff725ah563',
      userEmail: 'a@a.com',
      ...event,
    };

    const mockResponse = {
      ...createWaitlistDto,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    jest
      .spyOn(waitlistService, 'addToWaitlist')
      .mockResolvedValue(mockResponse);

    const result = await waitlistController.addToWaitlist(createWaitlistDto);

    expect(waitlistService.addToWaitlist).toHaveBeenCalledWith(
      createWaitlistDto,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call getWaitlistSpotById with correct ID', async () => {
    const mockWaitlistSpot = {
      id: '2875d9e9-b327-4f8f-94cd-0eff725ah965',
      queueId: 1,
      eventId: '2367d9e9-b327-4f8f-94cd-0eff725ah563',
      userEmail: 'a@a.com',
      createdAt: new Date('2024-10-06T16:51:06.458Z'),
      updatedAt: new Date('2024-10-06T16:51:06.458Z'),
      deletedAt: null,
    };

    jest
      .spyOn(waitlistService, 'getWaitlistSpotById')
      .mockResolvedValue(mockWaitlistSpot);

    const result = await waitlistController.getWaitlistSpotById(
      mockWaitlistSpot.id,
    );

    expect(waitlistService.getWaitlistSpotById).toHaveBeenCalledWith(
      mockWaitlistSpot.id,
    );
    expect(result).toEqual(mockWaitlistSpot);
  });

  it('should call deleteWaitlistSpot with correct ID', async () => {
    const id = '2367d9e9-b327-4f8f-94cd-0eff725ah563';
    const mockResponse = null;

    jest
      .spyOn(waitlistService, 'deleteWaitlistSpot')
      .mockResolvedValue(mockResponse);

    const result = await waitlistController.deleteWaitlist(id);

    expect(waitlistService.deleteWaitlistSpot).toHaveBeenCalledWith(id);
    expect(result).toEqual(mockResponse);
  });
});
