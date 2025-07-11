import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

// Services
import { UserService } from './services/user.service';
import { RoleService } from './services/role.service';

// Controllers
import { UserAdminController } from './controllers/./user-admin.controller';
import { RoleAdminController } from './controllers/role-admin.controller';

// Repositories
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';

// Module
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    AuthModule,
  ],
  controllers: [UserAdminController, RoleAdminController],
  providers: [
    UserService,
    RoleService,
    UserRepository,
    RoleRepository,
  ],
  exports: [
    UserService,
    RoleService,
    UserRepository,
    RoleRepository,
  ],
})
export class UserModule {}
