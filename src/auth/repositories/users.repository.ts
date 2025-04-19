import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { User } from './../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './../dto/create-user.dto';
import { isEmail } from 'class-validator';
import { Role } from './../../../common/enums/role.enum';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async registerAccount(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({
      ...createUserDto,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    try {
      await this.save(user);
      return user;
    } catch (error) {
      if (
        error.code === '23505' ||
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        throw new ConflictException('Account email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    if (!isEmail(email)) {
      throw new BadRequestException('This is not a valid email.');
    }
    const user = await this.findOne({ email });

    if (!user) {
      throw new NotFoundException('Invalid email/password');
    }
    return user;
  }
}
