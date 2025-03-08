import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { customResponse } from '../../common/response';
import { Request } from 'express';
import { FindManyOptions, ILike } from 'typeorm';
import { User } from './user.entity';
import { ResponseType as Response } from '../../common/response/response.enum';
import { generatePagination } from '../../common/util/pagination';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.usersRepository.createUser(authCredentialsDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = authCredentialsDto;

    const normalizedEmail = email.toLowerCase();

    const user = await this.usersRepository.findOne({ email: normalizedEmail });

    if (!user) {
      throw new UnauthorizedException('Please check your login credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Please check your login credentials');
    }

    const payload: JwtPayload = { email: normalizedEmail, roles: user.roles };
    const accessToken: string = await this.jwtService.sign(payload);

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
      customResponse({
        responseType: Response.INTERNAL_SERVER_ERROR,
        error: error.message,
        logName: 'booking-repository',
        logType: 'error',
      });
    }
  }

  verifyJwt(token: string) {
    return this.jwtService.verify(token);
  }
}
