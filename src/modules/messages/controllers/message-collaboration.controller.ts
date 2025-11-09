// modules/messages/controllers/message-collaboration.controller.ts
import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MessageCollaborationService } from '../services/message-collaboration.service';
import { MessageCollaborationMapper } from '../mappers/message-collaboration.mapper';
import { SendMessageDto } from '../dto/send-message.dto';

@Controller('messages')
export class MessageCollaborationController {
  constructor(
    private readonly messageService: MessageCollaborationService,
    private readonly messageMapper: MessageCollaborationMapper,
  ) {}

  /**
   * Envoyer un message dans une conversation
   * POST /messages/conversations/:conversationId
   */
  @Post('conversations/:conversationId')
  async sendMessage(@Param('conversationId', ParseIntPipe) conversationId: number, @Body() dto: SendMessageDto) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const message = await this.messageService.sendMessage(conversationId, mockUserId, mockUserType, dto);

    return {
      success: true,
      message: 'Message envoyé avec succès',
      data: this.messageMapper.toPublicData(message),
    };
  }

  /**
   * Récupérer les messages d'une conversation
   * GET /messages/conversations/:conversationId
   */
  @Get('conversations/:conversationId')
  async getMessagesByConversation(@Param('conversationId', ParseIntPipe) conversationId: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const messages = await this.messageService.getMessagesByConversation(conversationId, mockUserId, mockUserType);
    const data = messages.map((m) => this.messageMapper.toPublicData(m));

    return {
      success: true,
      data,
      meta: { count: data.length },
    };
  }

  /**
   * Marquer un message comme lu
   * PUT /messages/:id/read
   */
  @Put(':id/read')
  async markMessageAsRead(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const message = await this.messageService.markMessageAsRead(id, mockUserId, mockUserType);

    return {
      success: true,
      message: 'Message marqué comme lu',
      data: this.messageMapper.toPublicData(message),
    };
  }

  /**
   * Marquer tous les messages d'une conversation comme lus
   * PUT /messages/conversations/:conversationId/read-all
   */
  @Put('conversations/:conversationId/read-all')
  async markAllAsRead(@Param('conversationId', ParseIntPipe) conversationId: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    await this.messageService.markAllMessagesAsRead(conversationId, mockUserId, mockUserType);

    return {
      success: true,
      message: 'Tous les messages marqués comme lus',
    };
  }

  /**
   * Compter le total de messages non lus
   * GET /messages/unread/count
   */
  @Get('unread/count')
  async countUnreadMessages() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const count = await this.messageService.countTotalUnread(mockUserId, mockUserType);

    return {
      success: true,
      data: { count },
    };
  }

  /**
   * Récupérer les messages non lus d'une conversation
   * GET /messages/conversations/:conversationId/unread
   */
  @Get('conversations/:conversationId/unread')
  async getUnreadMessages(@Param('conversationId', ParseIntPipe) conversationId: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const messages = await this.messageService.getUnreadMessages(conversationId, mockUserId, mockUserType);
    const data = messages.map((m) => this.messageMapper.toPublicData(m));

    return {
      success: true,
      data,
      meta: { count: data.length },
    };
  }

  /**
   * Récupérer les messages liés à une transaction
   * GET /messages/transactions/:transactionId
   */
  @Get('transactions/:transactionId')
  async getMessagesByTransaction(@Param('transactionId', ParseIntPipe) transactionId: number) {
    const messages = await this.messageService.getMessagesByTransaction(transactionId);
    const data = messages.map((m) => this.messageMapper.toPublicData(m));

    return {
      success: true,
      data,
      meta: { count: data.length },
    };
  }

  /**
   * Récupérer les messages liés à un abonnement
   * GET /messages/abonnements/:abonnementId
   */
  @Get('abonnements/:abonnementId')
  async getMessagesByAbonnement(@Param('abonnementId', ParseIntPipe) abonnementId: number) {
    const messages = await this.messageService.getMessagesByAbonnement(abonnementId);
    const data = messages.map((m) => this.messageMapper.toPublicData(m));

    return {
      success: true,
      data,
      meta: { count: data.length },
    };
  }
}
