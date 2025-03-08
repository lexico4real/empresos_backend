import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersRepository } from './users.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: 'secret' }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: {
            getAllAuths: jest.fn(),
            getAuthById: jest.fn(),
            signUp: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should call getAllUsers with the correct parameters and return users', async () => {
    const mockRequest = {} as Request; // Simulate the request object
    const page = 1;
    const perPage = 10;
    const search = 'test';
    const mockUsers = [
      {
        id: 'ffedc635-a6fa-417d-83dc-508bb08af234',
        createdAt: '2024-10-05T10:23:44.793Z',
        updatedAt: '2024-10-05T10:23:44.793Z',
        deletedAt: null,
        email: 'lexico4real@gmail.com',
        roles: ['Super_Admin'],
      },
      {
        id: '5c914a5e-7b03-4343-82ba-cae1d671a0fd',
        createdAt: '2024-10-05T19:17:36.745Z',
        updatedAt: '2024-10-05T19:17:36.745Z',
        deletedAt: null,
        email: 'olu@gmail.com',
        roles: ['Admin'],
      },
    ];

    jest.spyOn(authService, 'getAllUsers').mockResolvedValue(mockUsers);

    const result = await authController.getAllUsers(
      page,
      perPage,
      search,
      mockRequest,
    );

    expect(authService.getAllUsers).toHaveBeenCalledWith(
      page,
      perPage,
      search,
      mockRequest,
    );
    expect(result).toEqual(mockUsers);
  });

  it('should handle service errors gracefully', async () => {
    const mockRequest = {} as Request;
    const page = 1;
    const perPage = 10;
    const search = 'test';
    const mockError = new Error('Service error');

    jest.spyOn(authService, 'getAllUsers').mockRejectedValue(mockError);

    await expect(
      authController.getAllUsers(page, perPage, search, mockRequest),
    ).rejects.toThrow(mockError);

    expect(authService.getAllUsers).toHaveBeenCalledWith(
      page,
      perPage,
      search,
      mockRequest,
    );
  });

  it('should call signUp with the correct credentials and return void', async () => {
    const mockAuthCredentialsDto: AuthCredentialsDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    jest.spyOn(authService, 'signUp').mockResolvedValue(undefined);

    await authController.signUp(mockAuthCredentialsDto);
    expect(authService.signUp).toHaveBeenCalledWith(mockAuthCredentialsDto);
  });

  it('should handle service errors gracefully', async () => {
    const mockAuthCredentialsDto: AuthCredentialsDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const mockError = new Error('Service error');

    jest.spyOn(authService, 'signUp').mockRejectedValue(mockError);

    await expect(authController.signUp(mockAuthCredentialsDto)).rejects.toThrow(
      mockError,
    );

    expect(authService.signUp).toHaveBeenCalledWith(mockAuthCredentialsDto);
  });

  it('should call signIn with the correct credentials and return an access token', async () => {
    const mockAuthCredentialsDto: AuthCredentialsDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockAccessToken = 'some-access-token';
    jest
      .spyOn(authService, 'signIn')
      .mockResolvedValue({ accessToken: mockAccessToken });

    const result = await authController.signIn(mockAuthCredentialsDto);

    expect(authService.signIn).toHaveBeenCalledWith(mockAuthCredentialsDto);
    expect(result).toEqual({ accessToken: mockAccessToken });
  });

  it('should handle service errors gracefully', async () => {
    const mockAuthCredentialsDto: AuthCredentialsDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const mockError = new Error('Service error');

    jest.spyOn(authService, 'signIn').mockRejectedValue(mockError);

    await expect(authController.signIn(mockAuthCredentialsDto)).rejects.toThrow(
      mockError,
    );

    expect(authService.signIn).toHaveBeenCalledWith(mockAuthCredentialsDto);
  });
});
