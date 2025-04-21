import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualCardRepository } from './virtual-card.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([VirtualCardRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
