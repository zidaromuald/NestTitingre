// modules/partenariats/dto/create-transaction-partenariat.dto.ts
import { IsNotEmpty, IsString, IsInt, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionPartenaritStatut } from '../entities/transaction-partenariat.entity';

export class CreateTransactionPartenaritDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  page_partenariat_id: number;

  @IsNotEmpty()
  @IsString()
  produit: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  quantite: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { message: 'Le prix unitaire doit être un nombre valide' })
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
