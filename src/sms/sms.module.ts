import { Global, Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { PassportModule } from '@nestjs/passport';

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
