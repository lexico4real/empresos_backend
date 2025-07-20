import { Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';
import { CacheModule } from 'src/cache/cache.module';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationRepository } from './configuration.repository';

@Module({
  imports: [
    CacheModule,
    TypeOrmModule.forFeature([ConfigurationRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
})
export class ConfigurationModule {}
