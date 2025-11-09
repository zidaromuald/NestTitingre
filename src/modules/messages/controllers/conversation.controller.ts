// modules/messages/controllers/conversation.controller.ts
import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { ConversationMapper } from '../mappers/conversation.mapper';
import { MessageCollaborationService } from '../services/message-collaboration.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';

@Controller('conversations')
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
  async createOrGetConversation(@Body() dto: CreateConversationDto) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const conversation = await this.conversationService.createOrGetConversation(mockUserId, mockUserType, dto);

    return {
      success: true,
      message: 'Conversation créée ou récupérée avec succès',
      data: this.conversationMapper.toPublicData(conversation),
    };
  }

  /**
   * Récupérer mes conversations
   * GET /conversations
   */
  @Get()
  async getMyConversations() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const conversationsWithUnread = await this.conversationService.getConversationsForParticipant(
      mockUserId,
      mockUserType,
    );

    const data = conversationsWithUnread.map(({ conversation, unreadCount }) =>
      this.conversationMapper.toPublicData(conversation, undefined, undefined, unreadCount),
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
  async getArchivedConversations() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const conversations = await this.conversationService.getArchivedConversations(mockUserId, mockUserType);
    const data = conversations.map((c) => this.conversationMapper.toPublicData(c));

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
  async countConversations() {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const count = await this.conversationService.countActiveConversations(mockUserId, mockUserType);

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
  async getConversationById(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const conversation = await this.conversationService.getConversationById(id, mockUserId, mockUserType);

    const unreadCount = await this.messageService.countUnreadInConversation(id, mockUserId, mockUserType);

    return {
      success: true,
      data: this.conversationMapper.toPublicData(conversation, undefined, undefined, unreadCount),
    };
  }

  /**
   * Archiver une conversation
   * PUT /conversations/:id/archive
   */
  @Put(':id/archive')
  async archiveConversation(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const conversation = await this.conversationService.archiveConversation(id, mockUserId, mockUserType);

    return {
      success: true,
      message: 'Conversation archivée avec succès',
      data: this.conversationMapper.toPublicData(conversation),
    };
  }

  /**
   * Désarchiver une conversation
   * PUT /conversations/:id/unarchive
   */
  @Put(':id/unarchive')
  async unarchiveConversation(@Param('id', ParseIntPipe) id: number) {
    const mockUserId = 1; // TODO: JWT
    const mockUserType = 'User' as 'User' | 'Societe'; // TODO: JWT

    const conversation = await this.conversationService.unarchiveConversation(id, mockUserId, mockUserType);

    return {
      success: true,
      message: 'Conversation désarchivée avec succès',
      data: this.conversationMapper.toPublicData(conversation),
    };
  }
}
