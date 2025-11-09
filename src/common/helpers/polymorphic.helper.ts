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
    const repository = repositories.get(relation.type);

    if (!repository) {
      throw new Error(`No repository found for type: ${relation.type}`);
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
   */
  static getTypeName(entity: any): string {
    if (entity.constructor && entity.constructor.name) {
      return entity.constructor.name;
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
