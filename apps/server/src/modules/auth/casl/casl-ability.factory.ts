import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../user/entities/role.entity';
import { Permission, ActionType } from '../entities/permission.entity';

// 定义所有可能的主体类型 - 包含字符串类型
type Subjects = InferSubjects<typeof User | typeof Role | typeof Permission> | 'all' | string;

// 应用能力类型 - 使用更宽松的类型
export type AppAbility = Ability<[string, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  /**
   * 为用户创建能力实例
   */
  createForUser(user: User): AppAbility {
    const permissions = this.extractUserPermissions(user);
    return this.buildAbility(permissions);
  }

  /**
   * 为权限列表创建能力实例
   */
  createForPermissions(permissions: Permission[]): AppAbility {
    return this.buildAbility(permissions);
  }

  /**
   * 提取用户的所有权限
   */
  private extractUserPermissions(user: User): Permission[] {
    if (!user.roles?.length) {
      return [];
    }

    const permissions: Permission[] = [];
    for (const role of user.roles) {
      if (role.permissions?.length) {
        permissions.push(...role.permissions);
      }
    }
    return permissions;
  }

  /**
   * 构建 CASL 能力实例
   */
  private buildAbility(permissions: Permission[]): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>
    );

    // 处理权限
    for (const permission of permissions) {
      const action = permission.action;
      const subject = this.mapSubject(permission.subject);

      if (permission.inverted) {
        cannot(action, subject, permission.conditions);
      } else {
        can(action, subject, permission.conditions);
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  /**
   * 映射数据库中的 subject 字符串到 CASL 类型
   * 直接返回字符串，CASL 会自动处理
   */
  private mapSubject(subject: string): string {
    // 直接返回字符串，CASL 支持字符串形式的 subject
    return subject;
  }
}
