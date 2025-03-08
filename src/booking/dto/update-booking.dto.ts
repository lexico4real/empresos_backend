import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  eventId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  userEmail: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  ticketNumber: number;
}
