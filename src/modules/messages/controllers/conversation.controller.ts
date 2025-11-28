// modules/messages/controllers/conversation.controller.ts
import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { ConversationMapper } from '../mappers/conversation.mapper';
import { MessageCollaborationService } from '../services/message-collaboration.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageCollaborationService,
    private readonly conversationMapper: ConversationMapper,
  ) {}

  /**
   * Créer ou récupérer une conversation
   * POST /conversations
   */
  @Post()
  async createOrGetConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';

    const conversation = await this.conversationService.createOrGetConversation(userId, userType, dto);

    return {
      success: true,
      message: 'Conversation créée ou récupérée avec succès',
      data: this.conversationMapper.toPublicData(conversation, undefined, undefined, undefined, userId, userType),
    };
  }

  /**
   * Récupérer mes conversations
   * GET /conversations
   */
  @Get()
  async getMyConversations(@CurrentUser() currentUser: User | Societe) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';

    const conversationsWithUnread = await this.conversationService.getConversationsForParticipant(
      userId,
      userType,
    );

    const data = conversationsWithUnread.map(({ conversation, unreadCount }) =>
      this.conversationMapper.toPublicData(conversation, undefined, undefined, unreadCount, userId, userType),
    );

    return {
      success: true,
      data,
      meta: { count: data.length },
    };
  }

  /**
   * Récupérer mes conversations archivées
   * GET /conversations/archived
   */
  @Get('archived')
  async getArchivedConversations(@CurrentUser() currentUser: User | Societe) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';

    const conversations = await this.conversationService.getArchivedConversations(userId, userType);
    const data = conversations.map((c) => this.conversationMapper.toPublicData(c, undefined, undefined, undefined, userId, userType));

    return {
      success: true,
      data,
      meta: { count: data.length },
    };
  }

  /**
   * Compter mes conversations actives
   * GET /conversations/count
   */
  @Get('count')
  async countConversations(@CurrentUser() currentUser: User | Societe) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';

    const count = await this.conversationService.countActiveConversations(userId, userType);

    return {
      success: true,
      data: { count },
    };
  }

  /**
   * Récupérer une conversation par ID
   * GET /conversations/:id
   */
  @Get(':id')
  async getConversationById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';

    const conversation = await this.conversationService.getConversationById(id, userId, userType);

    const unreadCount = await this.messageService.countUnreadInConversation(id, userId, userType);

    return {
      success: true,
      data: this.conversationMapper.toPublicData(conversation, undefined, undefined, unreadCount, userId, userType),
    };
  }

  /**
   * Archiver une conversation
   * PUT /conversations/:id/archive
   */
  @Put(':id/archive')
  async archiveConversation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';

    const conversation = await this.conversationService.archiveConversation(id, userId, userType);

    return {
      success: true,
      message: 'Conversation archivée avec succès',
      data: this.conversationMapper.toPublicData(conversation, undefined, undefined, undefined, userId, userType),
    };
  }

  /**
   * Désarchiver une conversation
   * PUT /conversations/:id/unarchive
   */
  @Put(':id/unarchive')
  async unarchiveConversation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const userId = currentUser.id;
    const userType = currentUser instanceof User ? 'User' : 'Societe';

    const conversation = await this.conversationService.unarchiveConversation(id, userId, userType);

    return {
      success: true,
      message: 'Conversation désarchivée avec succès',
      data: this.conversationMapper.toPublicData(conversation, undefined, undefined, undefined, userId, userType),
    };
  }
}
