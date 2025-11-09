// modules/partenariats/dto/validate-transaction.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class ValidateTransactionDto {
  @IsOptional()
  @IsString()
  commentaire?: string;
}
