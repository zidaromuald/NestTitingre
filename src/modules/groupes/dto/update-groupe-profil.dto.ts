// modules/groupes/dto/update-groupe-profil.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGroupeProfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photo_couverture?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  photo_profil?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description_detaillee?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  regles?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  lien_externe?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  couleur_theme?: string;
}
