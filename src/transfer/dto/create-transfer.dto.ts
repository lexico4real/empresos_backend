import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  senderAccount: string;

  @IsString()
  @IsNotEmpty()
  receiverAccount: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  narration?: string;
}
