import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";

// Entities
import { Permission } from "./entities/permission.entity";
import { UserSession } from "./entities/session.entity";
import { RbacConstraint } from "./entities/constraint.entity";

// Services
import { PermissionService } from "./services/permission.service";
import { AuthService } from "./services/auth.service";
import { RoleService } from "../user/services/role.service";
import { RoleInitService } from "./services/role-init.service";
import { SessionService } from "./services/session.service";
import { RoleHierarchyService } from "./services/role-hierarchy.service";

// Controllers
import { AuthAdminController } from "./controllers/auth-admin.controller";
import { RoleAdminController } from "@/modules/user/controllers/role-admin.controller";
import { PermissionAdminController } from "@/modules/auth/controllers/permission-admin.controller";
import { RoleInitAdminController } from "./controllers/role-init-admin.controller";

// Repositories
import { PermissionRepository } from "./repositories/permission.repository";

// entities
import { User } from "../user/entities/user.entity";
import { Role } from "../user/entities/role.entity";

// repositories
import { UserRepository } from "../user/repositories/user.repository";
import { RoleRepository } from "../user/repositories/role.repository";

// Guards
import { RbacAbilityFactory } from "./casl/rbac-ability.factory";
import { RbacPermissionsGuard } from "./guards/rbac-permissions.guard";

// Strategies
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

// Config
import { JwtConfig } from "./config/jwt.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, UserSession, RbacConstraint]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtConfig = new JwtConfig(configService);
        return {
          secret: jwtConfig.accessTokenSecret,
          signOptions: {
            expiresIn: jwtConfig.accessTokenExpiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [
    RoleAdminController,
    AuthAdminController,
    PermissionAdminController,
    RoleInitAdminController],
  providers: [
    // Services
    PermissionService,
    AuthService,
    RoleService,
    RoleInitService,
    SessionService,
    RoleHierarchyService,

    // Repositories
    UserRepository,
    RoleRepository,
    PermissionRepository,

    // Guards and Strategies
    RbacAbilityFactory,
    RbacPermissionsGuard,
    JwtStrategy,
    LocalStrategy,

    // Config
    JwtConfig,
  ],
  exports: [
    PermissionService,
    AuthService,
    RoleService,
    RoleInitService,
    SessionService,
    RoleHierarchyService,
    UserRepository,
    RoleRepository,
    PermissionRepository,
    RbacAbilityFactory,
    RbacPermissionsGuard,
    JwtConfig,
  ],
})
export class AuthModule {}
