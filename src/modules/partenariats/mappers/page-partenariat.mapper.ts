// modules/partenariats/mappers/page-partenariat.mapper.ts
import { Injectable } from '@nestjs/common';
import { PagePartenariat } from '../entities/page-partenariat.entity';
import { Abonnement } from '../../suivis/entities/abonnement.entity';

@Injectable()
export class PagePartenaritMapper {
  toPublicData(page: PagePartenariat, abonnement?: Abonnement) {
    return {
      id: page.id,
      abonnement_id: page.abonnement_id,
      titre: page.titre,
      description: page.description,
      logo_url: page.logo_url,
      couleur_theme: page.couleur_theme,
      total_transactions: page.total_transactions,
      montant_total: parseFloat(page.montant_total.toString()),
      date_debut_partenariat: page.date_debut_partenariat,
      derniere_transaction_at: page.derniere_transaction_at,
      visibilite: page.visibilite,
      secteur_activite: page.secteur_activite,
      is_active: page.is_active,
      metadata: page.metadata,
      created_at: page.created_at,
      updated_at: page.updated_at,
      abonnement: abonnement
        ? {
            id: abonnement.id,
            user_id: abonnement.user_id,
            societe_id: abonnement.societe_id,
            statut: abonnement.statut,
            plan_collaboration: abonnement.plan_collaboration,
          }
        : { id: page.abonnement_id },
    };
  }

  toListData(page: PagePartenariat) {
    return {
      id: page.id,
      titre: page.titre,
      secteur_activite: page.secteur_activite,
      total_transactions: page.total_transactions,
      montant_total: parseFloat(page.montant_total.toString()),
      derniere_transaction_at: page.derniere_transaction_at,
      is_active: page.is_active,
      created_at: page.created_at,
    };
  }
}
