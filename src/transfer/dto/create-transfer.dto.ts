import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransferDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  senderAccount: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiverAccount: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  narration?: string;
}
