// common/helpers/polymorphic.helper.ts
import { Repository, ObjectLiteral } from 'typeorm';

/**
 * Helper pour gérer les relations polymorphiques dans TypeORM
 * Similaire au système morphTo/morphMany de Laravel
 */

export interface PolymorphicRelation {
  id: number;
  type: string;
}

export class PolymorphicHelper {
  /**
   * Récupérer une entité polymorphique
   * Équivalent de morphTo() dans Laravel
   */
  static async morphTo<T>(
    relation: PolymorphicRelation,
    repositories: Map<string, Repository<any>>,
  ): Promise<T | null> {
    if (!relation.type || !relation.id) {
      console.warn(`[PolymorphicHelper] Invalid relation: type=${relation.type}, id=${relation.id}`);
      return null;
    }

    const repository = repositories.get(relation.type);

    if (!repository) {
      console.warn(`[PolymorphicHelper] No repository found for type: ${relation.type}`);
      return null;
    }

    return repository.findOne({ where: { id: relation.id } });
  }

  /**
   * Récupérer plusieurs entités qui appartiennent à une entité polymorphique
   * Équivalent de morphMany() dans Laravel
   */
  static async morphMany<T extends ObjectLiteral>(
    entityType: string,
    entityId: number,
    repository: Repository<T>,
    typeColumn: string,
    idColumn: string,
  ): Promise<T[]> {
    const where: any = {};
    where[typeColumn] = entityType;
    where[idColumn] = entityId;

    return repository.find({ where });
  }

  /**
   * Créer une relation polymorphique
   */
  static createPolymorphicRelation(
    entity: any,
    entityType: string,
  ): PolymorphicRelation {
    return {
      id: entity.id,
      type: entityType,
    };
  }

  /**
   * Obtenir le nom du type à partir de la classe
   * Gère les cas où l'objet a été désérialisé (depuis JWT par exemple)
   */
  static getTypeName(entity: any): string {
    // 1. Si c'est une vraie instance de classe TypeORM
    if (entity.constructor && entity.constructor.name && entity.constructor.name !== 'Object') {
      return entity.constructor.name;
    }

    // 2. Détection basée sur les propriétés spécifiques à chaque entité
    // User a typiquement: nom, prenom (ou prenoms), numero, email
    // Societe a typiquement: nom_societe, sigle, numero_registre

    if ('nom_societe' in entity || 'sigle' in entity || 'numero_registre' in entity) {
      return PolymorphicTypes.SOCIETE;
    }

    if ('prenom' in entity || 'prenoms' in entity || ('nom' in entity && 'numero' in entity)) {
      return PolymorphicTypes.USER;
    }

    // 3. Si l'entité a un champ userType (depuis le JWT)
    if (entity.userType) {
      return entity.userType === 'user' ? PolymorphicTypes.USER : PolymorphicTypes.SOCIETE;
    }

    // 4. Fallback: essayer de deviner par la présence de 'email' sans 'nom_societe'
    if ('email' in entity && !('nom_societe' in entity)) {
      return PolymorphicTypes.USER;
    }

    return 'Unknown';
  }
}

/**
 * Décorateur pour marquer une relation polymorphique
 */
export function Polymorphic(typeColumn: string, idColumn: string) {
  return function (target: any, propertyKey: string) {
    if (!target.constructor.polymorphicRelations) {
      target.constructor.polymorphicRelations = {};
    }

    target.constructor.polymorphicRelations[propertyKey] = {
      typeColumn,
      idColumn,
    };
  };
}

/**
 * Types polymorphiques constants pour éviter les erreurs de typage
 */
export enum PolymorphicTypes {
  USER = 'User',
  SOCIETE = 'Societe',
}
