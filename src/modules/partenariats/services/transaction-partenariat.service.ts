// modules/partenariats/services/transaction-partenariat.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionPartenariat, TransactionPartenaritStatut } from '../entities/transaction-partenariat.entity';
import { PagePartenariat } from '../entities/page-partenariat.entity';
import { TransactionPartenaritRepository } from '../repositories/transaction-partenariat.repository';
import { CreateTransactionPartenaritDto } from '../dto/create-transaction-partenariat.dto';
import { UpdateTransactionPartenaritDto } from '../dto/update-transaction-partenariat.dto';
import { ValidateTransactionDto } from '../dto/validate-transaction.dto';

@Injectable()
export class TransactionPartenaritService {
  constructor(
    @InjectRepository(TransactionPartenariat)
    private readonly transactionRepo: Repository<TransactionPartenariat>,
    private readonly transactionPartenaritRepository: TransactionPartenaritRepository,
    @InjectRepository(PagePartenariat)
    private readonly pageRepo: Repository<PagePartenariat>,
  ) {}

  /**
   * Créer une transaction (UNIQUEMENT par Société)
   */
  async createTransaction(
    societeId: number,
    dto: CreateTransactionPartenaritDto,
  ): Promise<TransactionPartenariat> {
    // Vérifier que c'est une Société qui crée
    if (!TransactionPartenariat.canBeCreatedBy('Societe')) {
      throw new ForbiddenException('Seule la Société peut créer des transactions');
    }

    // Vérifier que la PagePartenariat existe et appartient à la Société
    const page = await this.pageRepo.findOne({
      where: { id: dto.page_partenariat_id },
      relations: ['abonnement'],
    });

    if (!page) {
      throw new NotFoundException('PagePartenariat introuvable');
    }

    if (page.abonnement.societe_id !== societeId) {
      throw new ForbiddenException('Vous ne pouvez pas créer de transaction sur cette page');
    }

    // Créer la transaction
    const transaction = this.transactionRepo.create({
      ...dto,
      date_debut: new Date(dto.date_debut),
      date_fin: new Date(dto.date_fin),
      statut: dto.statut || TransactionPartenaritStatut.PENDING_VALIDATION,
      creee_par_societe: true,
      unite: dto.unite || 'Kg',
    });

    return this.transactionRepo.save(transaction);
  }

  /**
   * Récupérer toutes les transactions d'une page (pour Société)
   */
  async getTransactionsForSociete(
    societeId: number,
    pagePartenaritId: number,
  ): Promise<TransactionPartenariat[]> {
    const page = await this.pageRepo.findOne({
      where: { id: pagePartenaritId },
      relations: ['abonnement'],
    });

    if (!page) {
      throw new NotFoundException('PagePartenariat introuvable');
    }

    if (page.abonnement.societe_id !== societeId) {
      throw new ForbiddenException('Accès refusé à cette page');
    }

    return this.transactionPartenaritRepository.findByPagePartenariatId(pagePartenaritId);
  }

  /**
   * Récupérer toutes les transactions d'une page (User OU Société)
   * Vérifie que l'acteur a accès à cette page
   */
  async getTransactionsForPage(
    pagePartenaritId: number,
    actorId: number,
    actorType: 'User' | 'Societe',
  ): Promise<TransactionPartenariat[]> {
    const page = await this.pageRepo.findOne({
      where: { id: pagePartenaritId },
      relations: ['abonnement'],
    });

    if (!page) {
      throw new NotFoundException('PagePartenariat introuvable');
    }

    // Vérifier l'accès : soit le User de l'abonnement, soit la Société
    const hasAccess =
      (actorType === 'User' && page.abonnement.user_id === actorId) ||
      (actorType === 'Societe' && page.abonnement.societe_id === actorId);

    if (!hasAccess) {
      throw new ForbiddenException('Accès refusé à cette page');
    }

    return this.transactionPartenaritRepository.findByPagePartenariatId(pagePartenaritId);
  }

  /**
   * Récupérer les transactions en attente de validation pour un User
   */
  async getPendingTransactionsForUser(userId: number): Promise<TransactionPartenariat[]> {
    return this.transactionPartenaritRepository.findPendingForUser(userId);
  }

  /**
   * Récupérer une transaction par ID (avec vérification de permissions)
   */
  async getTransactionById(
    id: number,
    actorId: number,
    actorType: 'User' | 'Societe',
  ): Promise<TransactionPartenariat> {
    const transaction = await this.transactionPartenaritRepository.findByIdWithRelations(id);

    if (!transaction) {
      throw new NotFoundException('Transaction introuvable');
    }

    // Vérifier les permissions
    if (!transaction.canBeViewedBy(actorId, actorType)) {
      throw new ForbiddenException('Vous n\'avez pas accès à cette transaction');
    }

    return transaction;
  }

  /**
   * Modifier une transaction (UNIQUEMENT Société, si pas validée)
   */
  async updateTransaction(
    id: number,
    societeId: number,
    dto: UpdateTransactionPartenaritDto,
  ): Promise<TransactionPartenariat> {
    const transaction = await this.transactionPartenaritRepository.findByIdWithRelations(id);

    if (!transaction) {
      throw new NotFoundException('Transaction introuvable');
    }

    // Vérifier les permissions
    if (!transaction.canBeModifiedBy(societeId, 'Societe')) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cette transaction (déjà validée ou non autorisé)');
    }

    // Appliquer les modifications
    Object.assign(transaction, {
      ...dto,
      date_debut: dto.date_debut ? new Date(dto.date_debut) : transaction.date_debut,
      date_fin: dto.date_fin ? new Date(dto.date_fin) : transaction.date_fin,
    });

    return this.transactionRepo.save(transaction);
  }

  /**
   * Valider une transaction (UNIQUEMENT User)
   */
  async validateTransaction(
    id: number,
    userId: number,
    dto: ValidateTransactionDto,
  ): Promise<TransactionPartenariat> {
    const transaction = await this.transactionPartenaritRepository.findByIdWithRelations(id);

    if (!transaction) {
      throw new NotFoundException('Transaction introuvable');
    }

    // Vérifier les permissions
    if (!transaction.canBeValidatedBy(userId)) {
      throw new ForbiddenException('Vous ne pouvez pas valider cette transaction');
    }

    // Valider
    transaction.validateByUser(dto.commentaire);

    const savedTransaction = await this.transactionRepo.save(transaction);

    // Mettre à jour les statistiques de la PagePartenariat
    await this.updatePageStats(transaction.page_partenariat_id);

    return savedTransaction;
  }

  /**
   * Supprimer une transaction (UNIQUEMENT Société, si pas validée)
   */
  async deleteTransaction(id: number, societeId: number): Promise<void> {
    const transaction = await this.transactionPartenaritRepository.findByIdWithRelations(id);

    if (!transaction) {
      throw new NotFoundException('Transaction introuvable');
    }

    // Vérifier les permissions
    if (!transaction.canBeDeletedBy(societeId, 'Societe')) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer cette transaction (déjà validée ou non autorisé)');
    }

    await this.transactionRepo.remove(transaction);
  }

  /**
   * Mettre à jour les statistiques de la PagePartenariat
   */
  private async updatePageStats(pagePartenaritId: number): Promise<void> {
    const stats = await this.transactionPartenaritRepository.calculateTotalForPage(pagePartenaritId);

    const page = await this.pageRepo.findOne({ where: { id: pagePartenaritId } });

    if (page) {
      page.updateStats(stats.count, stats.total, new Date());
      await this.pageRepo.save(page);
    }
  }

  /**
   * Compter les transactions en attente pour un User
   */
  async countPendingForUser(userId: number): Promise<number> {
    return this.transactionPartenaritRepository.countPendingForUser(userId);
  }
}
