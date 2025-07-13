import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { AccessDto } from './dto/access.dto';
import { RolesConstant as Role } from 'src/common/enums/role.enum';

@ApiTags('users')
@Controller('users')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  createBankStaff(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.authService.signUp(createUserDto);
  }

  @Post('customer')
  @ApiBearerAuth('token')
  createCustomer(@Body() createUserDto: CreateUserDto): Promise<void> {
    createUserDto.role = Role.CUSTOMER;
    return this.authService.signUp(createUserDto);
  }

  @HttpCode(200)
  @Post('otp')
  getLoginOTP(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Req() req: Request,
  ) {
    return this.authService.getLoginOTP(authCredentialsDto, req.user);
  }

  @HttpCode(200)
  @Post('otp-admin')
  getLoginOTPAdmin(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Req() req: Request,
  ) {
    return this.authService.getLoginOTP(
      authCredentialsDto,
      req.user,
      'not_customer',
    );
  }

  @HttpCode(200)
  @Post('sign-in')
  validateLoginOtp(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Session() session?: any,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto, session);
  }

  @Get()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('token')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  getAllCustomers(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('search') search: string,
    @Req() req: Request,
  ): Promise<any> {
    return this.authService.getCustomers(page, perPage, search, req);
  }

  @UseGuards(AuthGuard())
  @Get('admins')
  async getAllAdmins(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('search') search: string,
    @Req() req: Request,
  ): Promise<any> {
    return this.authService.getOtherUsers(page, perPage, search, req);
  }

  @UseGuards(AuthGuard())
  @Post('role')
  async createRole(@Body() accessDto: AccessDto) {
    return await this.authService.createRole(accessDto);
  }

  @UseGuards(AuthGuard())
  @Patch(':id/deactivate')
  async deactivateUser(@Param('id') id: string) {
    return await this.authService.deactivateUser(id);
  }

  @UseGuards(AuthGuard())
  @Patch(':id/activate')
  async activateUser(@Param('id') id: string) {
    return await this.authService.activateUser(id);
  }

  @UseGuards(AuthGuard())
  @Patch(':id/role')
  async updateUserRole(@Param('id') id: string, @Body('role') role: Role) {
    return await this.authService.updateUserRole(id, role);
  }

  @UseGuards(AuthGuard())
  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return await this.authService.getUserByEmail(email);
  }

  @UseGuards(AuthGuard())
  @Post('role/privilege')
  async createPrivilege(@Body() accessDto: AccessDto) {
    return await this.authService.createPrivilege(accessDto);
  }

  @UseGuards(AuthGuard())
  @Delete('delete')
  async deleteUser(@Query('id') id: string) {
    return await this.authService.deleteUser(id);
  }
}
