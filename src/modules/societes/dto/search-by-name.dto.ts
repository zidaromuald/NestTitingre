// modules/societes/dto/search-by-name.dto.ts
import { IsString, MinLength } from 'class-validator';

export class SearchByNameDto {
  @IsString()
  @MinLength(2, { message: 'Au moins 2 caractères requis' })
  q: string;
}