// modules/users/dto/search-user.dto.ts
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class SearchUserDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(50)
  perPage: number = 15;
  
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  nom?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  prenom?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  activite?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  @Max(100)
  ageMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(18)
  @Max(100)
  ageMax?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['nom', 'prenom', 'activite', 'date_naissance', 'created_at'])
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}