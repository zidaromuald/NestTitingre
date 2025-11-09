import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class SearchSocieteDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  nomSociete?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  secteurActivite?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  typeProduit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  centreInteret?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  adresse?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verifiedOnly?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['societe', 'secteur_activite', 'created_at'])
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
