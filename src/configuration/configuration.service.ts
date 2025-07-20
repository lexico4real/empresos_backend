import { Injectable } from '@nestjs/common';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { ConfigurationRepository } from './configuration.repository';

@Injectable()
export class ConfigurationService {
  constructor(
    private readonly configurationRepository: ConfigurationRepository,
  ) {}

  createConfiguration(createConfigurationDto: CreateConfigurationDto) {
    return this.configurationRepository.createConfiguration(
      createConfigurationDto,
    );
  }

  getAllConfigurations(page: number, perPage: number, name: string, req: any) {
    return this.configurationRepository.getAllConfigurations(
      page,
      perPage,
      name,
      req,
    );
  }

  getConfigurationById(id: string) {
    return this.configurationRepository.getConfigurationById(id);
  }

  updateConfiguration(
    id: string,
    updateConfigurationDto: UpdateConfigurationDto,
  ) {
    return this.configurationRepository.updateConfiguration(
      id,
      updateConfigurationDto,
    );
  }

  deleteConfiguration(id: string) {
    return this.configurationRepository.deleteConfiguration(id);
  }
}
