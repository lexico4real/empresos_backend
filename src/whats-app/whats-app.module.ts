import { Global, Module } from '@nestjs/common';
import { WhatsAppService } from './whats-app.service';
import { WhatsAppController } from './whats-app.controller';
import { PassportModule } from '@nestjs/passport';

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
