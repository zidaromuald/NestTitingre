// modules/partenariats/controllers/transaction-partenariat.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { TransactionPartenaritService } from '../services/transaction-partenariat.service';
import { TransactionPartenaritMapper } from '../mappers/transaction-partenariat.mapper';
import { CreateTransactionPartenaritDto } from '../dto/create-transaction-partenariat.dto';
import { UpdateTransactionPartenaritDto } from '../dto/update-transaction-partenariat.dto';
import { ValidateTransactionDto } from '../dto/validate-transaction.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('transactions-partenariat')
@UseGuards(JwtAuthGuard)
export class TransactionPartenaritController {
  constructor(
    private readonly transactionService: TransactionPartenaritService,
    private readonly transactionMapper: TransactionPartenaritMapper,
  ) {}

  /**
   * Créer une transaction (Société uniquement)
   * POST /transactions-partenariat
   */
  @Post()
  async createTransaction(
    @Body() dto: CreateTransactionPartenaritDto,
    @CurrentUser() currentUser: any,
  ) {
    // Vérifier que c'est une Societe (JWT userType = 'societe')
    if (currentUser?.userType !== 'societe') {
      throw new ForbiddenException('Seule la Société peut créer des transactions');
    }

    const societeId = currentUser.id;
    const transaction = await this.transactionService.createTransaction(societeId, dto);
    return {
      success: true,
      message: 'Transaction créée avec succès',
      data: this.transactionMapper.toPublicData(transaction),
    };
  }

  /**
   * Récupérer les transactions d'une page (User OU Société peut accéder)
   * GET /transactions-partenariat/page/:pageId
   */
  @Get('page/:pageId')
  async getTransactionsForPage(
    @Param('pageId', ParseIntPipe) pageId: number,
    @CurrentUser() currentUser: any,
  ) {
    // Les deux peuvent accéder aux transactions de leur page
    const actorId = currentUser.id;
    const actorType = currentUser?.userType === 'user' ? 'User' : 'Societe';

    const transactions = await this.transactionService.getTransactionsForPage(pageId, actorId, actorType);
    const data = transactions.map((t) => this.transactionMapper.toPublicData(t));
    return {
      success: true,
      data,
      meta: { count: data.length },
    };
  }

  /**
   * Récupérer les transactions en attente de validation (User uniquement)
   * GET /transactions-partenariat/pending
   */
  @Get('pending')
  async getPendingTransactions(@CurrentUser() currentUser: any) {
    // Vérifier que c'est un User (JWT userType = 'user')
    if (currentUser?.userType !== 'user') {
      throw new ForbiddenException('Seul un User peut accéder aux transactions en attente de validation');
    }

    const userId = currentUser.id;
    const transactions = await this.transactionService.getPendingTransactionsForUser(userId);
    const data = transactions.map((t) => this.transactionMapper.toPublicData(t));
    return {
      success: true,
      data,
      meta: { count: data.length },
    };
  }

  /**
   * Compter les transactions en attente (User uniquement)
   * GET /transactions-partenariat/pending/count
   */
  @Get('pending/count')
  async countPending(@CurrentUser() currentUser: any) {
    // Vérifier que c'est un User (JWT userType = 'user')
    if (currentUser?.userType !== 'user') {
      throw new ForbiddenException('Seul un User peut compter les transactions en attente');
    }

    const userId = currentUser.id;
    const count = await this.transactionService.countPendingForUser(userId);
    return {
      success: true,
      data: { count },
    };
  }

  /**
   * Récupérer une transaction par ID
   * GET /transactions-partenariat/:id
   */
  @Get(':id')
  async getTransactionById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.id;
    const userType = currentUser?.userType === 'user' ? 'User' : 'Societe';
    const transaction = await this.transactionService.getTransactionById(id, userId, userType);
    return {
      success: true,
      data: this.transactionMapper.toPublicData(transaction),
    };
  }

  /**
   * Modifier une transaction (Société uniquement, si pas validée)
   * PUT /transactions-partenariat/:id
   */
  @Put(':id')
  async updateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionPartenaritDto,
    @CurrentUser() currentUser: any,
  ) {
    // Vérifier que c'est une Societe
    if (currentUser?.userType !== 'societe') {
      throw new ForbiddenException('Seule la Société peut modifier des transactions');
    }

    const societeId = currentUser.id;
    const transaction = await this.transactionService.updateTransaction(id, societeId, dto);
    return {
      success: true,
      message: 'Transaction modifiée avec succès',
      data: this.transactionMapper.toPublicData(transaction),
    };
  }

  /**
   * Valider une transaction (User uniquement)
   * PUT /transactions-partenariat/:id/validate
   */
  @Put(':id/validate')
  async validateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ValidateTransactionDto,
    @CurrentUser() currentUser: any,
  ) {
    // Vérifier que c'est un User
    if (currentUser?.userType !== 'user') {
      throw new ForbiddenException('Seul un User peut valider des transactions');
    }

    const userId = currentUser.id;
    const transaction = await this.transactionService.validateTransaction(id, userId, dto);
    return {
      success: true,
      message: 'Transaction validée avec succès',
      data: this.transactionMapper.toPublicData(transaction),
    };
  }

  /**
   * Supprimer une transaction (Société uniquement, si pas validée)
   * DELETE /transactions-partenariat/:id
   */
  @Delete(':id')
  async deleteTransaction(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: any,
  ) {
    // Vérifier que c'est une Societe
    if (currentUser?.userType !== 'societe') {
      throw new ForbiddenException('Seule la Société peut supprimer des transactions');
    }

    const societeId = currentUser.id;
    await this.transactionService.deleteTransaction(id, societeId);
    return {
      success: true,
      message: 'Transaction supprimée avec succès',
    };
  }
}
