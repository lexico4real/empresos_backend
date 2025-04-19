import { AccessDto } from './../dto/access.dto';
import { EntityRepository, Repository } from 'typeorm';
import { UserRole } from './../entities/user-role.entity';
import { BadRequestException } from '@nestjs/common';

@EntityRepository(UserRole)
export class UserRoleRepository extends Repository<UserRole> {
  async createRole(accessDto: AccessDto): Promise<UserRole> {
    const newRole = this.create(accessDto);
    return await this.save(newRole);
  }

  async getRoleByName(name: string): Promise<UserRole> {
    if (!name) {
      throw new BadRequestException('Role name cannot be empty');
    }

    const role = await this.findOne({ name });
    if (!role) {
      throw new BadRequestException('No role found with this option');
    }
    return role;
  }
}
