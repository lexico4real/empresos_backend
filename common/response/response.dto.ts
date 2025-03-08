import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResponseDto {
  @IsString()
  @IsNotEmpty()
  responseType: string;

  @IsOptional()
  @IsNotEmpty()
  partMsg?: string;

  @IsOptional()
  @IsNotEmpty()
  error?: string;

  @IsOptional()
  @IsNotEmpty()
  logName?: string;

  @IsOptional()
  @IsNotEmpty()
  logType?: string;
}
