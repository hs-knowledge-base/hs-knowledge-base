import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";

// Entities
import { Permission } from "./entities/permission.entity";

// Services
import { PermissionService } from "./services/permission.service";
import { AuthService } from "./services/auth.service";
import { RoleService } from "../user/services/role.service";

// Controllers
import { AuthAdminController } from "./controllers/auth-admin.controller";
import { RoleAdminController } from "@/modules/user/controllers/role-admin.controller";

// Repositories
import { PermissionRepository } from "./repositories/permission.repository";

// entities
import { User } from "../user/entities/user.entity";
import { Role } from "../user/entities/role.entity";

// repositories
import { UserRepository } from "../user/repositories/user.repository";
import { RoleRepository } from "../user/repositories/role.repository";

// Guards
import { CaslAbilityFactory } from "./casl/casl-ability.factory";
import { PoliciesGuard } from "./guards/permissions.guard";

// Strategies
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

// Config
import { JwtConfig } from "./config/jwt.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
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
  controllers: [RoleAdminController, AuthAdminController],
  providers: [
    // Services
    PermissionService,
    AuthService,
    RoleService,

    // Repositories
    UserRepository,
    RoleRepository,
    PermissionRepository,

    // Guards and Strategies
    CaslAbilityFactory,
    PoliciesGuard,
    JwtStrategy,
    LocalStrategy,

    // Config
    JwtConfig,
  ],
  exports: [
    PermissionService,
    AuthService,
    RoleService,
    UserRepository,
    RoleRepository,
    PermissionRepository,
    CaslAbilityFactory,
    PoliciesGuard,
    JwtConfig,
  ],
})
export class AuthModule {}
