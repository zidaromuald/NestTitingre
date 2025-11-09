// modules/partenariats/controllers/transaction-partenariat.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { TransactionPartenaritService } from '../services/transaction-partenariat.service';
import { TransactionPartenaritMapper } from '../mappers/transaction-partenariat.mapper';
import { CreateTransactionPartenaritDto } from '../dto/create-transaction-partenariat.dto';
import { UpdateTransactionPartenaritDto } from '../dto/update-transaction-partenariat.dto';
import { ValidateTransactionDto } from '../dto/validate-transaction.dto';

@Controller('transactions-partenariat')
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
  async createTransaction(@Body() dto: CreateTransactionPartenaritDto) {
    const mockSocieteId = 1; // TODO: JWT
    const transaction = await this.transactionService.createTransaction(mockSocieteId, dto);
    return {
      success: true,
      message: 'Transaction créée avec succès',
      data: this.transactionMapper.toPublicData(transaction),
    };
  }

  /**
   * Récupérer les transactions d'une page (Société uniquement)
   * GET /transactions-partenariat/page/:pageId
   */
  @Get('page/:pageId')
  async getTransactionsForPage(@Param('pageId', ParseIntPipe) pageId: number) {
    const mockSocieteId = 1; // TODO: JWT
    const transactions = await this.transactionService.getTransactionsForSociete(mockSocieteId, pageId);
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
  async getPendingTransactions() {
    const mockUserId = 1; // TODO: JWT
    const transactions = await this.transactionService.getPendingTransactionsForUser(mockUserId);
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
  async countPending() {
    const mockUserId = 1; // TODO: JWT
    const count = await this.transactionService.countPendingForUser(mockUserId);
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
  async getTransactionById(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT
    const transaction = await this.transactionService.getTransactionById(id, mockUserId, mockUserType);
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
  async updateTransaction(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTransactionPartenaritDto) {
    const mockSocieteId = 1; // TODO: JWT
    const transaction = await this.transactionService.updateTransaction(id, mockSocieteId, dto);
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
  async validateTransaction(@Param('id', ParseIntPipe) id: number, @Body() dto: ValidateTransactionDto) {
    const mockUserId = 1; // TODO: JWT
    const transaction = await this.transactionService.validateTransaction(id, mockUserId, dto);
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
  async deleteTransaction(@Param('id', ParseIntPipe) id: number) {
    const mockSocieteId = 1; // TODO: JWT
    await this.transactionService.deleteTransaction(id, mockSocieteId);
    return {
      success: true,
      message: 'Transaction supprimée avec succès',
    };
  }
}
