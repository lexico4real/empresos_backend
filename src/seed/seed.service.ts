import { Injectable, Logger } from '@nestjs/common';
import { getRepository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole } from 'src/auth/entities/user-role.entity';
import { User } from 'src/auth/entities/user.entity';
import { UserPrivilege } from 'src/auth/entities/user-privilege.entity';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { RolesConstant } from 'src/common/enums/role.enum';
import { PrivilegesConstant } from 'src/common/enums/privilege.enum';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  async seed() {
    const userRoleRepository = getRepository(UserRole);
    const userPrivilegeRepository = getRepository(UserPrivilege);
    const userRepository = getRepository(User);

    const roles = Object.values(RolesConstant);
    const createdRoles = [];

    try {
      for (const roleName of roles) {
        let role = await userRoleRepository.findOne({
          where: { name: roleName as string },
        });

        if (!role) {
          role = userRoleRepository.create({
            name: roleName as string,
            comment: `${roleName as string} role`,
          });
          await userRoleRepository.save(role);
          this.logger.log(`Created role: ${roleName}`);
        } else {
          this.logger.log(`Role already exists: ${roleName}`);
        }

        createdRoles.push(role);
      }
    } catch (error) {
      this.logger.log('Error creating roles');
    }

    const privileges = Object.values(PrivilegesConstant);
    const createdPrivileges = [];

    try {
      for (const privilegeName of privileges) {
        let privilege = await userPrivilegeRepository.findOne({
          where: { name: privilegeName },
        });

        if (!privilege) {
          privilege = userPrivilegeRepository.create({
            name: privilegeName as string,
            comment: `${privilegeName} Privilege`,
          });
          await userPrivilegeRepository.save(privilege);
          this.logger.log(`Created Privilege: ${privilegeName}`);
        } else {
          this.logger.log(`Privilege already exists: ${privilegeName}`);
        }

        createdPrivileges.push(privilege);
      }
    } catch (error) {}

    const passwordHash = await bcrypt.hash('Password@1234', 10);

    const sampleUsers = [
      {
        email: 'lexico4real@gmail.com',
        password: passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '09060794442',
        accountStatus: AccountStatus.ACTIVE,
        isConfirmed: true,
        userRole: createdRoles.find((role) => role.name === 'admin'),
      },
      {
        email: 'admin@empresos.com',
        password: passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '08030000001',
        accountStatus: AccountStatus.ACTIVE,
        isConfirmed: true,
        userRole: createdRoles.find((role) => role.name === 'admin'),
      },
      {
        email: 'customer@empresos.com',
        password: passwordHash,
        firstName: 'customer',
        lastName: 'User',
        phoneNumber: '08030000002',
        accountStatus: AccountStatus.ACTIVE,
        isConfirmed: true,
        userRole: createdRoles.find((role) => role.name === 'customer'),
      },
      {
        email: 'staff@empresos.com',
        password: passwordHash,
        firstName: 'Business',
        lastName: 'Owner',
        phoneNumber: '08030000003',
        accountStatus: AccountStatus.ACTIVE,
        isConfirmed: true,
        userRole: createdRoles.find((role) => role.name === 'staff'),
      },
    ];

    try {
      for (const userData of sampleUsers) {
        const existingUser = await userRepository.findOne({
          where: { email: userData.email },
        });

        if (!existingUser) {
          const user = userRepository.create(userData);
          await userRepository.save(user);
          this.logger.log(`Created user: ${userData.email}`);
        } else {
          this.logger.log(`User already exists: ${userData.email}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to create role', error);
    }

    try {
      const adminRole = await userRoleRepository.findOne({
        where: { name: 'admin' },
        relations: ['userPrivileges'],
      });

      const allPrivileges = await userPrivilegeRepository.find();

      if (adminRole) {
        adminRole.userPrivileges = allPrivileges;
        await userRoleRepository.save(adminRole);
        this.logger.log('✅ Assigned all privileges to admin role.');
      } else {
        this.logger.warn('⚠️ Admin role not found.');
      }
    } catch (error) {
      this.logger.error('Failed to assign privileges to admin role', error);
    }
  }
}
