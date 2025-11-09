// modules/transactions/services/transaction-polymorphic.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionCollaboration } from '../entities/transaction-collaboration.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import {
  PolymorphicHelper,
  PolymorphicTypes,
} from '../../../common/helpers/polymorphic.helper';

/**
 * Service pour gérer les relations polymorphiques des Transactions
 */
@Injectable()
export class TransactionPolymorphicService {
  constructor(
    @InjectRepository(TransactionCollaboration)
    private readonly transactionRepository: Repository<TransactionCollaboration>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Societe)
    private readonly societeRepository: Repository<Societe>,
  ) {}

  /**
   * Récupérer le partenaire d'une transaction (User ou Societe)
   * Équivalent: $transaction->partenaire dans Laravel
   */
  async getPartenaire(
    transaction: TransactionCollaboration,
  ): Promise<User | Societe | null> {
    const repositories = new Map<string, Repository<any>>([
      [PolymorphicTypes.USER, this.userRepository],
      [PolymorphicTypes.SOCIETE, this.societeRepository],
    ]);

    return PolymorphicHelper.morphTo<User | Societe>(
      {
        id: transaction.partenaire_id,
        type: transaction.partenaire_type,
      },
      repositories,
    );
  }

  /**
   * Récupérer toutes les transactions où un User est partenaire
   * Équivalent: $user->transactionsCommePartenaire() dans Laravel
   */
  async getTransactionsByUserAsPartner(userId: number): Promise<
    TransactionCollaboration[]
  > {
    return this.transactionRepository.find({
      where: {
        partenaire_id: userId,
        partenaire_type: PolymorphicTypes.USER,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Récupérer toutes les transactions où une Societe est partenaire
   * Équivalent: $societe->transactionsCommePartenaire() dans Laravel
   */
  async getTransactionsBySocieteAsPartner(societeId: number): Promise<
    TransactionCollaboration[]
  > {
    return this.transactionRepository.find({
      where: {
        partenaire_id: societeId,
        partenaire_type: PolymorphicTypes.SOCIETE,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Récupérer TOUTES les transactions d'un User
   * (En tant que client principal OU partenaire)
   * Équivalent: $user->toutesTransactionsCollaboration() dans Laravel
   */
  async getAllTransactionsByUser(userId: number): Promise<
    TransactionCollaboration[]
  > {
    return this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.user_id = :userId', { userId })
      .orWhere(
        '(transaction.partenaire_id = :userId AND transaction.partenaire_type = :userType)',
        {
          userId,
          userType: PolymorphicTypes.USER,
        },
      )
      .orderBy('transaction.created_at', 'DESC')
      .getMany();
  }

  /**
   * Récupérer TOUTES les transactions d'une Societe
   * (En tant que société principale OU partenaire)
   * Équivalent: $societe->toutesTransactionsCollaboration() dans Laravel
   */
  async getAllTransactionsBySociete(societeId: number): Promise<
    TransactionCollaboration[]
  > {
    return this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.societe_id = :societeId', { societeId })
      .orWhere(
        '(transaction.partenaire_id = :societeId AND transaction.partenaire_type = :societeType)',
        {
          societeId,
          societeType: PolymorphicTypes.SOCIETE,
        },
      )
      .orderBy('transaction.created_at', 'DESC')
      .getMany();
  }

  /**
   * Créer une transaction avec partenaire polymorphique
   */
  async createTransactionWithPartner(
    transactionData: Partial<TransactionCollaboration>,
    client: User | Societe,
    partenaire: User | Societe,
  ): Promise<TransactionCollaboration> {
    const clientType = PolymorphicHelper.getTypeName(client);
    const partenaireType = PolymorphicHelper.getTypeName(partenaire);

    const transaction = this.transactionRepository.create({
      ...transactionData,
      // Client principal
      ...(clientType === PolymorphicTypes.USER
        ? { user_id: client.id }
        : { societe_id: client.id }),
      // Partenaire polymorphique
      partenaire_id: partenaire.id,
      partenaire_type: partenaireType,
    });

    return this.transactionRepository.save(transaction);
  }

  /**
   * Récupérer une transaction avec tous ses acteurs
   */
  async getTransactionWithActors(transactionId: number): Promise<{
    transaction: TransactionCollaboration | null;
    client: User | Societe | null;
    partenaire: User | Societe | null;
  }> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user', 'societe'],
    });

    if (!transaction) {
      return { transaction: null, client: null, partenaire: null };
    }

    // Récupérer le client
    const client = transaction.user_id
      ? transaction.user
      : transaction.societe;

    // Récupérer le partenaire
    const partenaire = await this.getPartenaire(transaction);

    return { transaction, client, partenaire };
  }

  /**
   * Vérifier si une entité est impliquée dans une transaction
   */
  isEntityInvolvedInTransaction(
    transaction: TransactionCollaboration,
    entity: User | Societe,
  ): boolean {
    const typeName = PolymorphicHelper.getTypeName(entity);

    // Vérifier si l'entité est le client principal
    if (
      (typeName === PolymorphicTypes.USER &&
        transaction.user_id === entity.id) ||
      (typeName === PolymorphicTypes.SOCIETE &&
        transaction.societe_id === entity.id)
    ) {
      return true;
    }

    // Vérifier si l'entité est le partenaire
    if (
      transaction.partenaire_id === entity.id &&
      transaction.partenaire_type === typeName
    ) {
      return true;
    }

    return false;
  }
}
