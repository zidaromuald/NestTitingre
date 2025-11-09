// common/decorators/user-type.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const USER_TYPE_KEY = 'userType';
export const UserType = (...types: string[]) => 
  SetMetadata(USER_TYPE_KEY, types);
