// modules/groupes/dto/add-membre.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { MembreRole } from '../entities/groupe.entity';

export class AddMembreDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsOptional()
  @IsEnum(MembreRole)
  role?: MembreRole;
}
