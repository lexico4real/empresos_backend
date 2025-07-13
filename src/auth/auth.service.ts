import { For } from './../../node_modules/@babel/types/lib/index-legacy.d';
import { AccessDto } from './dto/access.dto';
import {
  Injectable,
  Req,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersRepository } from './repositories/users.repository';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './entities/user.entity';
import { InitiateRegistationDto } from './dto/initiate-registration.dto';
import { SmsService } from './../sms/sms.service';
import { OtpService } from './../otp/otp.service';
import { EmailService } from './../email/email.service';
import { UserRoleRepository } from './repositories/user-role.repository';
import { UserPrivilegeRepository } from './repositories/user-privilege.repository';
import { AccountService } from 'src/account/account.service';
import { RolesConstant as Role } from 'src/common/enums/role.enum';
import { generatePagination } from 'src/common/util/pagination';
import { UserRole } from './entities/user-role.entity';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { use } from 'passport';

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

    await this.emailService.sendMail({
      to: email,
      subject: 'Login OTP',
      text: `Your Registration token is ${otp}}`,
    });
    return { secret };
  }

  async signUp(createUserDto: CreateUserDto): Promise<void> {
    let roleEntity: UserRole = null;

    if (!createUserDto.role) {
      throw new BadRequestException('Kindly provide the user role');
    }

    roleEntity = await this.usersRepository.manager.findOne(UserRole, {
      where: { name: createUserDto.role },
    });

    if (!roleEntity) {
      throw new NotFoundException('User role not found');
    }

    const user = await this.usersRepository.registerAccount(
      createUserDto,
      roleEntity,
    );

    if (createUserDto.role === Role.CUSTOMER) {
      await this.accountService.createAccount(user);
    }
    // await this.emailService.sendMail({
    //   to: user.email,
    //   subject: 'New Account',
    //   text: `Welcome ${user.firstName}! This is a confirmation of the New Account You opened with us.`,
    // });
  }

  async getLoginOTP(
    authCredentialsDto: AuthCredentialsDto,
    userData: any,
    dRole?: string,
  ) {
    const { email, password } = authCredentialsDto;
    const normalizedEmail = email.toLowerCase();
    let user: User;
    if (!userData) {
      user = await this.usersRepository.getUserByEmail(normalizedEmail);
    } else {
      user = userData;
    }

    if (dRole && dRole === 'not_customer') {
      const role = await this.userRoleRepository.findOne(user.userRole.id);
      if (role.name === 'customer') {
        throw new ForbiddenException(
          'You do not have permission to access this resource',
        );
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Wrong email/password. Please check your login credentials',
      );
    }

    delete user.password;

    const { phoneNumber, email: _email } = user;

    const token = await this.otpService.generateOtp(
      {
        phoneNumber,
      },
      user,
    );

    // await this.emailService.sendMail({
    //   to: _email,
    //   subject: 'Login OTP',
    //   text: `Your Login OTP is ${token?.otp}`,
    // });

    return {
      secret: token?.secret || null,
      statuscode: HttpStatus.OK,
      message: `OTP sent successfully to your registered email: ${_email}`,
    };
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
    session: any,
  ): Promise<{ accessToken: any }> {
    const { email, password, secret, otp } = authCredentialsDto;

    const normalizedEmail = email.toLowerCase();

    const user = await this.usersRepository.getUserByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException(
        'Wrong email/password. Please check your login credentials',
      );
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Your account is not active. Please contact support.',
      );
    }

    const accounts = await this.accountService.getUserAccounts(user.id);

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

    user.accounts = accounts;

    session.currentUser = {
      ...user,
    };

    return { accessToken, ...user };
  }

  async getCustomers(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<any> {
    try {
      console.log(await this.usersRepository.find());
      const skip = (page - 1) * perPage;

      const query = this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userRole', 'userRole')
        .where('userRole.name = :customer', {
          customer: 'customer',
        });

      if (search) {
        query.andWhere('user.email ILIKE :search', { search: `%${search}%` });
      }

      query.orderBy('user.email', 'ASC').skip(skip).take(perPage);

      const [result, total] = await query.getManyAndCount();

      for (const user of result) delete user.password;

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong: AS-ERROR');
    }
  }

  async getOtherUsers(
    page = 1,
    perPage = 10,
    search: string,
    @Req() req: Request,
  ): Promise<any> {
    try {
      const skip = (page - 1) * perPage;

      const query = this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userRole', 'userRole')
        .where('userRole.name != :customer or userRole.name IS NULL', {
          customer: 'customer',
        });

      if (search) {
        query.andWhere('user.email ILIKE :search', { search: `%${search}%` });
      }

      query.orderBy('user.email', 'ASC').skip(skip).take(perPage);

      const [result, total] = await query.getManyAndCount();

      for (const user of result) delete user.password;

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong: AS-ERROR');
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

  async getUserByEmail(email: string) {
    const user = await this.usersRepository.getUserByEmail(email);
    const accounts = await this.accountService.getUserAccounts(user.id);
    user.accounts = accounts;
    delete user.password;
    return user;
  }

  async deleteUser(userId: string) {
    const user = await this.usersRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async deactivateUser(userId: string) {
    const user = await this.usersRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.accountStatus = AccountStatus.INACTIVE;
    await this.usersRepository.save(user);
    return { message: 'User deactivated successfully' };
  }

  async activateUser(userId: string) {
    const user = await this.usersRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.accountStatus = AccountStatus.ACTIVE;
    await this.usersRepository.save(user);
    return { message: 'User activated successfully' };
  }

  async updateUserRole(userId: string, roleName: string) {
    const user = await this.usersRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.userRoleRepository.findOne({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    user.userRole = role;
    await this.usersRepository.save(user);
    return { message: 'User role updated successfully' };
  }
}
