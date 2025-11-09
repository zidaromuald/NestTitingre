// modules/messages/messages.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { MessageCollaboration } from './entities/message-collaboration.entity';
import { TransactionCollaboration } from '../transactions/entities/transaction-collaboration.entity';
import { Abonnement } from '../suivis/entities/abonnement.entity';
import { User } from '../users/entities/user.entity';
import { Societe } from '../societes/entities/societe.entity';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageCollaborationRepository } from './repositories/message-collaboration.repository';
import { ConversationMapper } from './mappers/conversation.mapper';
import { MessageCollaborationMapper } from './mappers/message-collaboration.mapper';
import { ConversationService } from './services/conversation.service';
import { MessageCollaborationService } from './services/message-collaboration.service';
import { ConversationController } from './controllers/conversation.controller';
import { MessageCollaborationController } from './controllers/message-collaboration.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      MessageCollaboration,
      TransactionCollaboration,
      Abonnement,
      User,
      Societe,
    ]),
  ],
  providers: [
    // Repositories
    ConversationRepository,
    MessageCollaborationRepository,
    // Mappers
    ConversationMapper,
    MessageCollaborationMapper,
    // Services
    ConversationService,
    MessageCollaborationService,
  ],
  controllers: [ConversationController, MessageCollaborationController],
  exports: [
    // Repositories
    ConversationRepository,
    MessageCollaborationRepository,
    // Mappers
    ConversationMapper,
    MessageCollaborationMapper,
    // Services
    ConversationService,
    MessageCollaborationService,
  ],
})
export class MessagesModule {}
