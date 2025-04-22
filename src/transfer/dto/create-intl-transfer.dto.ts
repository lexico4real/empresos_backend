import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateIntlTransferDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  senderName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  senderAccount: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiverName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiverAccount: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiverBankName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiverBankSwiftCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiverPhone?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiverCountry: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  narration?: string;
}
