import { Controller, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('otp')
@UseGuards(AuthGuard())
@ApiBearerAuth('token')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}
}
