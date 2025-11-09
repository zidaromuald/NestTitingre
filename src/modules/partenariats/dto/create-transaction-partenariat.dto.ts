// modules/partenariats/dto/create-transaction-partenariat.dto.ts
import { IsNotEmpty, IsString, IsInt, IsDecimal, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { TransactionPartenaritStatut } from '../entities/transaction-partenariat.entity';

export class CreateTransactionPartenaritDto {
  @IsNotEmpty()
  @IsInt()
  page_partenariat_id: number;

  @IsNotEmpty()
  @IsString()
  produit: string;

  @IsNotEmpty()
  @IsInt()
  quantite: number;

  @IsNotEmpty()
  @IsDecimal()
  prix_unitaire: number;

  @IsNotEmpty()
  @IsDateString()
  date_debut: string;

  @IsNotEmpty()
  @IsDateString()
  date_fin: string;

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
