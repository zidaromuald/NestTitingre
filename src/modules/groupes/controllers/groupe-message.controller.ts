// modules/groupes/controllers/groupe-message.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { MessageGroupeService } from '../services/message-groupe.service';
import { MessageGroupeMapper } from '../mappers/message-groupe.mapper';
import { SendGroupMessageDto } from '../dto/send-group-message.dto';
import { UpdateGroupMessageDto } from '../dto/update-group-message.dto';

@Controller('groupes/:groupeId/messages')
@UseGuards(JwtAuthGuard)
export class GroupeMessageController {
  constructor(
    private readonly messageService: MessageGroupeService,
    private readonly messageMapper: MessageGroupeMapper,
  ) {}

  /**
   * Envoyer un message dans un groupe
   * POST /groupes/:groupeId/messages
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Body() dto: SendGroupMessageDto,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.id;

    // Debug: Afficher les informations de l'utilisateur actuel
    console.log('=== CONTROLLER DEBUG ===');
    console.log('currentUser:', currentUser);
    console.log('currentUser.userType:', currentUser.userType);
    console.log('currentUser.id:', currentUser.id);

    // Utiliser le champ userType ajouté par la stratégie JWT
    const userType = currentUser.userType === 'user' ? 'User' : 'Societe';
    console.log('userType déterminé:', userType);

    const message = await this.messageService.sendMessage(groupeId, userId, userType, dto);

    return {
      success: true,
      message: 'Message envoyé avec succès',
      data: this.messageMapper.toPublicData(message, userId),
    };
  }

  /**
   * Récupérer les messages d'un groupe
   * GET /groupes/:groupeId/messages
   */
  @Get()
  async getMessages(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @CurrentUser() currentUser: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const userId = currentUser.id;
    const userType = currentUser.userType === 'user' ? 'User' : 'Societe';

    const messages = await this.messageService.getMessagesByGroupe(
      groupeId,
      userId,
      limit || 100,
      offset || 0,
      userType,
    );

    const data = this.messageMapper.toPublicDataArray(messages, userId);

    return {
      success: true,
      data,
      meta: {
        count: data.length,
        limit: limit || 100,
        offset: offset || 0,
      },
    };
  }

  /**
   * Récupérer les messages non lus d'un groupe
   * GET /groupes/:groupeId/messages/unread
   */
  @Get('unread')
  async getUnreadMessages(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.id;
    const userType = currentUser.userType === 'user' ? 'User' : 'Societe';
    const messages = await this.messageService.getUnreadMessages(groupeId, userId, userType);
    const data = this.messageMapper.toPublicDataArray(messages, userId);

    return {
      success: true,
      data,
      meta: { count: data.length },
    };
  }

  /**
   * Récupérer les messages épinglés d'un groupe
   * GET /groupes/:groupeId/messages/pinned
   */
  @Get('pinned')
  async getPinnedMessages(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.id;
    const userType = currentUser.userType === 'user' ? 'User' : 'Societe';
    const messages = await this.messageService.getPinnedMessages(groupeId, userId, userType);
    const data = this.messageMapper.toPublicDataArray(messages, userId);

    return {
      success: true,
      data,
      meta: { count: data.length },
    };
  }

  /**
   * Récupérer les statistiques de messages d'un groupe
   * GET /groupes/:groupeId/messages/stats
   */
  @Get('stats')
  async getMessagesStats(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.id;
    const userType = currentUser.userType === 'user' ? 'User' : 'Societe';
    const stats = await this.messageService.getMessagesStats(groupeId, userId, userType);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Marquer un message comme lu
   * PUT /groupes/:groupeId/messages/:id/read
   */
  @Put(':id/read')
  async markMessageAsRead(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Param('id', ParseIntPipe) messageId: number,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.id;
    const userType = currentUser.userType === 'user' ? 'User' : 'Societe';
    const message = await this.messageService.markMessageAsRead(messageId, userId, userType);

    return {
      success: true,
      message: 'Message marqué comme lu',
      data: this.messageMapper.toPublicData(message, userId),
    };
  }

  /**
   * Marquer tous les messages d'un groupe comme lus
   * PUT /groupes/:groupeId/messages/mark-all-read
   */
  @Put('mark-all-read')
  async markAllMessagesAsRead(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.id;
    const userType = currentUser.userType === 'user' ? 'User' : 'Societe';
    await this.messageService.markAllMessagesAsRead(groupeId, userId, userType);

    return {
      success: true,
      message: 'Tous les messages ont été marqués comme lus',
    };
  }

  /**
   * Modifier un message
   * PUT /groupes/:groupeId/messages/:id
   */
  @Put(':id')
  async updateMessage(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Param('id', ParseIntPipe) messageId: number,
    @Body() dto: UpdateGroupMessageDto,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.id;
    const userType = currentUser.userType === 'user' ? 'User' : 'Societe';
    const message = await this.messageService.updateMessage(messageId, userId, userType, dto);

    return {
      success: true,
      message: 'Message modifié avec succès',
      data: this.messageMapper.toPublicData(message, userId),
    };
  }

  /**
   * Supprimer un message
   * DELETE /groupes/:groupeId/messages/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteMessage(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Param('id', ParseIntPipe) messageId: number,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.id;
    const userType = currentUser.userType === 'user' ? 'User' : 'Societe';
    await this.messageService.deleteMessage(messageId, userId, userType);

    return {
      success: true,
      message: 'Message supprimé avec succès',
    };
  }

  /**
   * Épingler/Désépingler un message (admin/modérateur uniquement)
   * PUT /groupes/:groupeId/messages/:id/pin
   */
  @Put(':id/pin')
  async pinMessage(
    @Param('groupeId', ParseIntPipe) groupeId: number,
    @Param('id', ParseIntPipe) messageId: number,
    @CurrentUser() currentUser: any,
  ) {
    const userId = currentUser.id;
    const message = await this.messageService.pinMessage(messageId, userId);

    return {
      success: true,
      message: message.is_pinned ? 'Message épinglé' : 'Message désépinglé',
      data: this.messageMapper.toPublicData(message, userId),
    };
  }
}
