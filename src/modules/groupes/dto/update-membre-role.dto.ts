// modules/groupes/dto/update-membre-role.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MembreRole } from '../entities/groupe.entity';

export class UpdateMembreRoleDto {
  @IsNotEmpty()
  @IsEnum(MembreRole)
  role: MembreRole;
}
