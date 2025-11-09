// modules/partenariats/mappers/transaction-partenariat.mapper.ts
import { Injectable } from '@nestjs/common';
import { TransactionPartenariat } from '../entities/transaction-partenariat.entity';
import { PagePartenariat } from '../entities/page-partenariat.entity';

@Injectable()
export class TransactionPartenaritMapper {
  toPublicData(transaction: TransactionPartenariat, page?: PagePartenariat) {
    return {
      id: transaction.id,
      page_partenariat_id: transaction.page_partenariat_id,
      produit: transaction.produit,
      quantite: transaction.quantite,
      prix_unitaire: parseFloat(transaction.prix_unitaire.toString()),
      prix_total: parseFloat(transaction.prix_total.toString()),
      date_debut: transaction.date_debut,
      date_fin: transaction.date_fin,
      periode_label: transaction.periode_label,
      unite: transaction.unite,
      categorie: transaction.categorie,
      statut: transaction.statut,
      validee_par_user: transaction.validee_par_user,
      date_validation_user: transaction.date_validation_user,
      commentaire_user: transaction.commentaire_user,
      creee_par_societe: transaction.creee_par_societe,
      metadata: transaction.metadata,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
      page: page
        ? {
            id: page.id,
            titre: page.titre,
            abonnement_id: page.abonnement_id,
          }
        : undefined,
      duree_jours: transaction.date_debut && transaction.date_fin ? transaction.getDuree() : null,
      peut_etre_validee: transaction.canBeValidatedByUser(),
      is_en_attente: transaction.isPendingValidation(),
      is_validee: transaction.isValidated(),
    };
  }

  toListData(transaction: TransactionPartenariat) {
    return {
      id: transaction.id,
      produit: transaction.produit,
      quantite: transaction.quantite,
      prix_total: parseFloat(transaction.prix_total.toString()),
      date_debut: transaction.date_debut,
      date_fin: transaction.date_fin,
      periode_label: transaction.periode_label,
      statut: transaction.statut,
      validee_par_user: transaction.validee_par_user,
      created_at: transaction.created_at,
    };
  }
}
