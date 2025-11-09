// modules/users/mappers/user.mapper.ts
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

export interface UserPublicData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numero: string;
  activite?: string;
  date_naissance: Date;
  age?: number;
  email_verified_at?: Date;
  created_at: Date;
}

@Injectable()
export class UserMapper {
  toPublicData(user: User, includeAge = false): UserPublicData {
    const publicData: UserPublicData = {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      numero: user.numero,
      activite: user.activite,
      date_naissance: user.date_naissance,
      email_verified_at: user.email_verified_at,
      created_at: user.created_at,
    };

    if (includeAge) {
      publicData.age = user.age;
    }

    return publicData;
  }

  toAuthData(user: User) {
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      numero: user.numero,
    };
  }

  toAutocompleteData(user: User) {
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      activite: user.activite,
    };
  }
}