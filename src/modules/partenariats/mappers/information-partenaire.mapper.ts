// modules/partenariats/mappers/information-partenaire.mapper.ts
import { Injectable } from '@nestjs/common';
import { InformationPartenaire } from '../entities/information-partenaire.entity';
import { PagePartenariat } from '../entities/page-partenariat.entity';

@Injectable()
export class InformationPartenaireMapper {
  toPublicData(info: InformationPartenaire, page?: PagePartenariat) {
    return {
      id: info.id,
      page_partenariat_id: info.page_partenariat_id,
      partenaire_id: info.partenaire_id,
      partenaire_type: info.partenaire_type,
      creee_par: info.creee_par,
      nom_affichage: info.nom_affichage,
      description: info.description,
      logo_url: info.logo_url,
      localite: info.localite,
      adresse_complete: info.adresse_complete,
      numero_telephone: info.numero_telephone,
      email_contact: info.email_contact,
      secteur_activite: info.secteur_activite,
      // Informations agriculture
      superficie: info.superficie,
      type_culture: info.type_culture,
      maison_etablissement: info.maison_etablissement,
      contact_controleur: info.contact_controleur,
      // Informations entreprise
      siege_social: info.siege_social,
      date_creation: info.date_creation,
      certificats: info.certificats,
      numero_registration: info.numero_registration,
      capital_social: info.capital_social ? parseFloat(info.capital_social.toString()) : null,
      chiffre_affaires: info.chiffre_affaires ? parseFloat(info.chiffre_affaires.toString()) : null,
      // Informations communes
      nombre_employes: info.nombre_employes,
      type_organisation: info.type_organisation,
      modifiable_par: info.modifiable_par,
      visible_sur_page: info.visible_sur_page,
      metadata: info.metadata,
      created_at: info.created_at,
      updated_at: info.updated_at,
      page: page
        ? {
            id: page.id,
            titre: page.titre,
          }
        : undefined,
      is_user: info.isUser(),
      is_societe: info.isSociete(),
      is_agricole: info.isAgricole(),
    };
  }

  toListData(info: InformationPartenaire) {
    return {
      id: info.id,
      partenaire_type: info.partenaire_type,
      nom_affichage: info.nom_affichage,
      secteur_activite: info.secteur_activite,
      localite: info.localite,
      visible_sur_page: info.visible_sur_page,
      created_at: info.created_at,
    };
  }
}
