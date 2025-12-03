// modules/suivis/dto/gerer-solde.dto.ts
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

/**
 * DTO pour créditer ou débiter le solde d'un abonnement
 */
export class GererSoldeDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Le montant doit être supérieur à 0' })
  montant: number;
}
