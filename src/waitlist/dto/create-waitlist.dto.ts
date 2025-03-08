import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWaitlistDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  userEmail: string;
}
