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
import { Permission, Action, Subject } from '../entities/permission.entity';

type Subjects = InferSubjects<typeof User | typeof Role | typeof Permission> | 'all' | 'Document' | 'KnowledgeBase';

export type AppAbility = Ability<[Action, Subjects]>;

// 映射数据库 Subject 枚举到 CASL 类型
const subjectMap: Record<Subject, Subjects> = {
  [Subject.USER]: User,
  [Subject.ROLE]: Role,
  [Subject.PERMISSION]: Permission,
  [Subject.DOCUMENT]: 'Document',
  [Subject.KNOWLEDGE_BASE]: 'KnowledgeBase',
  [Subject.ALL]: 'all',
};

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (!user.roles || user.roles.length === 0) {
      // 默认权限：只能读取自己的信息
      can(Action.READ, User, { id: user.id });
      return build({
        detectSubjectType: (item) =>
          item.constructor as ExtractSubjectType<Subjects>,
      });
    }

    // 遍历用户的所有角色和权限
    for (const role of user.roles) {
      if (role.permissions) {
        for (const permission of role.permissions) {
          const subject = subjectMap[permission.subject];
          if (permission.inverted) {
            cannot(permission.action as any, subject as any, permission.conditions);
          } else {
            can(permission.action as any, subject as any, permission.conditions);
          }
        }
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  createForPermissions(permissions: Permission[]): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    for (const permission of permissions) {
      const subject = subjectMap[permission.subject];
      if (permission.inverted) {
        cannot(permission.action as any, subject as any, permission.conditions);
      } else {
        can(permission.action as any, subject as any, permission.conditions);
      }
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
