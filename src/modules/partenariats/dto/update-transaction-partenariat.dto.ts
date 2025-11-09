// modules/partenariats/dto/update-transaction-partenariat.dto.ts
import { IsOptional, IsString, IsInt, IsDecimal, IsDateString, IsEnum } from 'class-validator';
import { TransactionPartenaritStatut } from '../entities/transaction-partenariat.entity';

export class UpdateTransactionPartenaritDto {
  @IsOptional()
  @IsString()
  produit?: string;

  @IsOptional()
  @IsInt()
  quantite?: number;

  @IsOptional()
  @IsDecimal()
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
