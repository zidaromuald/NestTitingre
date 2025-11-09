import { IsString, MinLength } from 'class-validator';

export class AutocompleteDto {
  @IsString()
  @MinLength(2, { message: 'Au moins 2 caractères requis' })
  term: string;
}