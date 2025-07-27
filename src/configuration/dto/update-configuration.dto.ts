import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateConfigurationDto } from './create-configuration.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateConfigurationDto extends PartialType(
  CreateConfigurationDto,
) {
  @ApiPropertyOptional({ description: 'Name of the configuration' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Value of the configuration' })
  @IsOptional()
  value?: string;
}
