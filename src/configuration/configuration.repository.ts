import { EntityRepository, Repository } from 'typeorm';
import { generatePagination } from 'src/common/util/pagination';
import { Configuration } from './entities/configuration.entity';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

@EntityRepository(Configuration)
export class ConfigurationRepository extends Repository<Configuration> {
  async createConfiguration(data: Partial<Configuration>) {
    try {
      const configuration = this.create(data);
      return await this.save(configuration);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create configuration');
    }
  }

  async getAllConfigurations(page = 1, perPage = 10, name?: string, req?: any) {
    try {
      const skip = (page - 1) * perPage;

      const query = this.createQueryBuilder('configuration');

      if (name) {
        query.where('configuration.name = :name', { name });
      }

      query.skip(skip).take(perPage);

      const [result, total] = await query.getManyAndCount();

      return generatePagination(page, perPage, total, req, result);
    } catch (error) {
      throw new InternalServerErrorException('Failed to get configurations');
    }
  }

  async getConfigurationById(id: string) {
    try {
      const configuration = await this.findOne(id);
      if (!configuration) {
        throw new NotFoundException(`Configuration with ID ${id} not found`);
      }
      return configuration;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get configuration');
    }
  }

  async updateConfiguration(id: string, data: Partial<Configuration>) {
    try {
      await this.findOneOrFail(id);
      await this.update(id, data);
      return this.getConfigurationById(id);
    } catch (error) {
      if (error.name === 'EntityNotFound') {
        throw new NotFoundException(`Configuration with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to update configuration');
    }
  }

  async deleteConfiguration(id: string) {
    try {
      const configuration = await this.getConfigurationById(id);
      return this.remove(configuration);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete configuration');
    }
  }
}
