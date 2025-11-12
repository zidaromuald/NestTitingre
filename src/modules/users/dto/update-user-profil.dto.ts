// modules/users/dto/update-user-profil.dto.ts
import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdateUserProfilDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  photo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competences?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  experience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  formation?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  github?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  portfolio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  langues?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  disponibilite?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaire_souhaite?: number;
}
