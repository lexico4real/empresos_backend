import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVirtualCardDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cardHolderName: string;
}
