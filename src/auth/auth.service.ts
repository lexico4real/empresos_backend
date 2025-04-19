import { AccessDto } from './dto/access.dto';
import {
  Injectable,
  Req,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { FindManyOptions, ILike } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersRepository } from './repositories/users.repository';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './entities/user.entity';
import { generatePagination } from '@common/util/pagination';
import { InitiateRegistationDto } from './dto/initiate-registration.dto';
import { SmsService } from './../sms/sms.service';
import { OtpService } from './../otp/otp.service';
import { EmailService } from './../email/email.service';
import { UserRoleRepository } from './repositories/user-role.repository';
import { UserPrivilegeRepository } from './repositories/user-privilege.repository';
import { Role } from '@common/enums/role.enum';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    @InjectRepository(UserRoleRepository)
    private userRoleRepository: UserRoleRepository,
    @InjectRepository(UserPrivilegeRepository)
    private userPrivilegeRepository: UserPrivilegeRepository,
    private accountService: AccountService,
    private jwtService: JwtService,
    private smsService: SmsService,
    private otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}

  async initiateRegistration(initiateRegistationDto: InitiateRegistationDto) {
    const { email, phoneNumber } = initiateRegistationDto;
    const user = await this.usersRepository.findOne({
      where: { email, phoneNumber },
    });
    if (user) {
      throw new BadRequestException(
        'This email is already registered. Please login.',
      );
    }

    const { otp, secret } = await this.otpService.generateOtp(
      { phoneNumber },
      user,
    );

    // await this.smsService.sendSms({
    //   to: phoneNumber,
    //   message: `Your Registration token is ${otp}`,
    // });

    await this.emailService.sendMail(
      email,
      'Login OTP',
      `Your Registration token is ${otp}}`,
    );
    return { secret };
  }

  async signUp(createUserDto: CreateUserDto): Promise<void> {
    const user = await this.usersRepository.registerAccount(createUserDto);
    if (createUserDto.role === Role.CUSTOMER) {
      await this.accountService.createAccount(user);
    }
  }

  async getLoginOTP(authCredentialsDto: AuthCredentialsDto, userData: any) {
    const { email } = authCredentialsDto;
    const normalizedEmail = email.toLowerCase();
    let user: User;
    if (!userData) {
      user = await this.usersRepository.getUserByEmail(normalizedEmail);
    } else {
      user = userData;
    }

    const { phoneNumber, email: _email } = user;

    const token = await this.otpService.generateOtp(
      {
        phoneNumber,
      },
      user,
    );

    // await this.smsService.sendSms({
    //   to: phoneNumber,
    //   message: `Your Login token is ${token?.otp}`,
    // });

    await this.emailService.sendMail(
      _email,
      'Login OTP',
      `Your Login OTP is ${token?.otp}`,
    );

    return {
      secret: token?.secret || null,
      statuscode: HttpStatus.OK,
      message: `OTP sent successfully to your registered email: ${_email}`,
    };
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
    session: any,
  ): Promise<{ accessToken: string }> {
    const { email, password, secret, otp } = authCredentialsDto;

    const normalizedEmail = email.toLowerCase();

    const user = await this.usersRepository.findOne({ email: normalizedEmail });

    if (!user) {
      throw new UnauthorizedException(
        'Wrong email/password. Please check your login credentials',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Wrong email/password. Please check your login credentials',
      );
    }

    const payload: JwtPayload = {
      email: normalizedEmail,
      roles: user.userRole,
    };

    const { otpIsValid } = await this.otpService.validateOtp(
      secret,
      otp,
      'LOGIN',
    );
    if (!otpIsValid) {
      throw new BadRequestException('Invalid/expired OTP');
    }

    const accessToken: string = await this.jwtService.sign(payload);

    delete user.password;

    session.currentUser = {
      ...user,
    };

    return { accessToken };
  }

  async getAllUsers(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<any> {
    try {
      const skip = (page - 1) * perPage;

      const where: FindManyOptions<User>['where'] = search
        ? [{ email: ILike(`%${search}%`) }]
        : undefined;

      const [result, total] = await this.usersRepository.findAndCount({
        where,
        order: { email: 'ASC' },
        skip,
        take: perPage,
      });

      for (const user of result) delete user.password;

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      throw new InternalServerErrorException('Some thing went wrong: AS-ERROR');
    }
  }

  async createRole(accessDto: AccessDto) {
    return await this.userRoleRepository.createRole(accessDto);
  }

  async createPrivilege(accessDto: AccessDto) {
    return await this.userPrivilegeRepository.createPrivilege(accessDto);
  }

  verifyJwt(token: string) {
    return this.jwtService.verify(token);
  }
}
