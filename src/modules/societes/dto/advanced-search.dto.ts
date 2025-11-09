// modules/societes/dto/advanced-search.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class AdvancedSearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  secteur?: string;

  @IsOptional()
  @IsString()
  produit?: string;

  @IsOptional()
  @IsString()
  interet?: string;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verifiedOnly?: boolean;
}
