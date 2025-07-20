import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigurationService } from './configuration.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('configuration')
@UseGuards(AuthGuard())
@ApiBearerAuth('token')
@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}
  @Post()
  createConfiguration(@Body() createConfigurationDto: CreateConfigurationDto) {
    return this.configurationService.createConfiguration(
      createConfigurationDto,
    );
  }
  @Get()
  getAllConfigurations(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
    @Query('name') name: string,
    @Req() req: Request,
  ) {
    return this.configurationService.getAllConfigurations(
      page,
      perPage,
      name,
      req,
    );
  }

  @Patch(':id')
  updateConfiguration(
    @Param('id') id: string,
    @Body() updateConfigurationDto: UpdateConfigurationDto,
  ) {
    return this.configurationService.updateConfiguration(
      id,
      updateConfigurationDto,
    );
  }

  @Get(':id')
  getConfigurationById(@Param('id') id: string) {
    return this.configurationService.getConfigurationById(id);
  }

  @Delete(':id')
  deleteConfiguration(@Param('id') id: string) {
    return this.configurationService.deleteConfiguration(id);
  }
}
