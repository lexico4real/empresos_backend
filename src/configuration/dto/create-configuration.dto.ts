import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConfigurationDto {
  @ApiProperty({ description: 'Name of the configuration' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Value of the configuration' })
  @IsString()
  @IsNotEmpty()
  value: string;
}
