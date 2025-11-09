// modules/societes/mappers/societe.mapper.ts
import { Injectable } from '@nestjs/common';
import { Societe } from '../entities/societe.entity';

export interface SocietePublicData {
  id: number;
  nom_societe: string;
  email: string;
  numero: string;
  secteur_activite: string;
  type_produit: string;
  centre_interet: string;
  adresse?: string;
  email_verified_at?: Date;
  created_at: Date;
}

@Injectable()
export class SocieteMapper {
  toPublicData(societe: Societe): SocietePublicData {
    return {
      id: societe.id,
      nom_societe: societe.nom_societe,
      email: societe.email,
      numero: societe.numero,
      secteur_activite: societe.secteur_activite,
      type_produit: societe.type_produit,
      centre_interet: societe.centre_interet,
      adresse: societe.adresse,
      email_verified_at: societe.email_verified_at,
      created_at: societe.created_at,
    };
  }

  toAuthData(societe: Societe) {
    return {
      id: societe.id,
      nom_societe: societe.nom_societe,
      email: societe.email,
      numero: societe.numero,
    };
  }

  toSearchByNameData(societe: Societe) {
    return {
      id: societe.id,
      nom_societe: societe.nom_societe,
      secteur_activite: societe.secteur_activite,
      adresse: societe.adresse,
    };
  }

  toAutocompleteData(societe: Societe) {
    return {
      id: societe.id,
      nom_societe: societe.nom_societe,
      secteur_activite: societe.secteur_activite,
      type_produit: societe.type_produit,
    };
  }
}