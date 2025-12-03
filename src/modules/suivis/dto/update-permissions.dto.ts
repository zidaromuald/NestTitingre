// modules/suivis/dto/update-permissions.dto.ts
import { IsArray, IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO pour mettre à jour uniquement les permissions d'un abonnement
 */
export class UpdatePermissionsDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
