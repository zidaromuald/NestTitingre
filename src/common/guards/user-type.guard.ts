// common/guards/user-type.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_TYPE_KEY } from '../decorators/user-type.decorator';

@Injectable()
export class UserTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTypes = this.reflector.getAllAndOverride<string[]>(
      USER_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTypes) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    const hasPermission = requiredTypes.some((type) => user?.userType === type);

    if (!hasPermission) {
      const typeMessage = requiredTypes.includes('societe')
        ? 'sociétés'
        : requiredTypes.includes('user')
        ? 'utilisateurs individuels'
        : 'utilisateurs autorisés';

      throw new ForbiddenException(
        `Cette route est réservée aux ${typeMessage}. Votre type: ${user.userType || 'inconnu'}`
      );
    }

    return true;
  }
}
