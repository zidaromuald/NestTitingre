// modules/groupes/dto/create-groupe.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { GroupeType, GroupeCategorie } from '../entities/groupe.entity';

export class CreateGroupeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  nom: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(GroupeType)
  type?: GroupeType;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(100000)
  maxMembres?: number;

  @IsOptional()
  @IsEnum(GroupeCategorie)
  categorie?: GroupeCategorie;

  @IsOptional()
  @IsInt()
  adminUserId?: number;

  // Ces champs seront remplis automatiquement
  created_by_id?: number;
  created_by_type?: string;
}
