// modules/partenariats/dto/update-transaction-partenariat.dto.ts
import { IsOptional, IsString, IsInt, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionPartenaritStatut } from '../entities/transaction-partenariat.entity';

export class UpdateTransactionPartenaritDto {
  @IsOptional()
  @IsString()
  produit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  quantite?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Le prix unitaire doit être un nombre valide' })
  prix_unitaire?: number;

  @IsOptional()
  @IsDateString()
  date_debut?: string;

  @IsOptional()
  @IsDateString()
  date_fin?: string;

  @IsOptional()
  @IsString()
  periode_label?: string;

  @IsOptional()
  @IsString()
  unite?: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsEnum(TransactionPartenaritStatut)
  statut?: TransactionPartenaritStatut;

  @IsOptional()
  metadata?: Record<string, any>;
}
