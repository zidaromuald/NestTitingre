// modules/suivis/services/invitation-suivi.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InvitationSuivi, InvitationSuiviStatus } from '../entities/invitation-suivi.entity';
import { InvitationSuiviRepository } from '../repositories/invitation-suivi.repository';
import { CreateInvitationSuiviDto } from '../dto/create-invitation-suivi.dto';
import { Suivre } from '../entities/suivre.entity';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { SuivreRepository } from '../repositories/suivre.repository';

@Injectable()
export class InvitationSuiviService {
  constructor(
    @InjectRepository(InvitationSuivi) private readonly invitationRepo: Repository<InvitationSuivi>,
    private readonly invitationSuiviRepository: InvitationSuiviRepository,
    @InjectRepository(Suivre) private readonly suivreRepo: Repository<Suivre>,
    private readonly suivreRepository: SuivreRepository,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Societe) private readonly societeRepo: Repository<Societe>,
    private dataSource: DataSource,
  ) {}

  /**
   * Envoyer une invitation de suivi (clic "Suivre")
   */
  async envoyerInvitation(senderId: number, senderType: string, dto: CreateInvitationSuiviDto): Promise<InvitationSuivi> {
    // Vérifier qu'on ne s'envoie pas à soi-même
    if (dto.receiver_type === senderType && dto.receiver_id === senderId) {
      throw new BadRequestException('Vous ne pouvez pas vous suivre vous-même');
    }

    // Vérifier que le sender existe
    if (senderType === 'User') {
      const user = await this.userRepo.findOne({ where: { id: senderId }});
      if (!user) throw new NotFoundException('Utilisateur envoyeur introuvable');
    } else {
      const societe = await this.societeRepo.findOne({ where: { id: senderId }});
      if (!societe) throw new NotFoundException('Société envoyeuse introuvable');
    }

    // Vérifier que la cible existe
    if (dto.receiver_type === 'User') {
      const user = await this.userRepo.findOne({ where: { id: dto.receiver_id }});
      if (!user) throw new NotFoundException('Utilisateur cible introuvable');
    } else {
      const societe = await this.societeRepo.findOne({ where: { id: dto.receiver_id }});
      if (!societe) throw new NotFoundException('Société cible introuvable');
    }

    // Vérifier si invitation déjà envoyée (PENDING)
    const existingPending = await this.invitationSuiviRepository.hasInvitationPending(senderId, senderType, dto.receiver_id, dto.receiver_type);
    if (existingPending) throw new ConflictException('Invitation déjà envoyée en attente de réponse');

    // Vérifier si connexion mutuelle existe déjà
    const alreadyConnected = await this.suivreRepository.isSuivant(senderId, senderType, dto.receiver_id, dto.receiver_type);
    if (alreadyConnected) throw new ConflictException('Vous êtes déjà connectés');

    // Créer l'invitation
    const invitation = this.invitationRepo.create({
      sender_id: senderId,
      sender_type: senderType,
      receiver_id: dto.receiver_id,
      receiver_type: dto.receiver_type,
      message: dto.message,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    });

    return this.invitationRepo.save(invitation);
  }

  /**
   * Accepter une invitation → Crée 2 Suivre mutuels
   */
  async accepterInvitation(invitationId: number, userId: number, userType: string): Promise<{ invitation: InvitationSuivi; suivres: [Suivre, Suivre] }> {
    const invitation = await this.invitationRepo.findOne({ where: { id: invitationId }});
    if (!invitation) throw new NotFoundException('Invitation introuvable');

    // Normaliser le userType reçu du JWT (lowercase) vers le format DB (capitalized)
    const normalizedUserType = userType === 'user' ? 'User' : 'Societe';

    // Vérifier que l'utilisateur connecté est bien le destinataire de l'invitation
    if (invitation.receiver_id !== userId || invitation.receiver_type !== normalizedUserType) {
      throw new ForbiddenException('Cette invitation ne vous est pas destinée');
    }

    // Vérifier que l'invitation peut être acceptée
    if (!invitation.canBeAccepted()) {
      throw new BadRequestException('Cette invitation ne peut plus être acceptée (expirée ou déjà traitée)');
    }

    // Transaction atomique: accepter invitation + créer 2 Suivre
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Mettre à jour l'invitation
      invitation.status = InvitationSuiviStatus.ACCEPTED;
      invitation.responded_at = new Date();
      await queryRunner.manager.save(invitation);

      // 2. Créer Suivre A → B (sender suit receiver)
      const suivre1 = this.suivreRepo.create({
        user_id: invitation.sender_id,
        user_type: invitation.sender_type, // User ou Societe
        followed_id: invitation.receiver_id,
        followed_type: invitation.receiver_type, // User ou Societe
      });
      const savedSuivre1 = await queryRunner.manager.save(suivre1);

      // 3. Créer Suivre B → A (receiver suit sender - mutuel)
      const suivre2 = this.suivreRepo.create({
        user_id: invitation.receiver_id,
        user_type: invitation.receiver_type, // User ou Societe
        followed_id: invitation.sender_id,
        followed_type: invitation.sender_type, // User ou Societe
      });
      const savedSuivre2 = await queryRunner.manager.save(suivre2);

      await queryRunner.commitTransaction();
      return { invitation, suivres: [savedSuivre1, savedSuivre2] };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Refuser une invitation
   */
  async refuserInvitation(invitationId: number, userId: number, userType: string): Promise<InvitationSuivi> {
    const invitation = await this.invitationRepo.findOne({ where: { id: invitationId }});
    if (!invitation) throw new NotFoundException('Invitation introuvable');

    // Normaliser le userType reçu du JWT (lowercase) vers le format DB (capitalized)
    const normalizedUserType = userType === 'user' ? 'User' : 'Societe';

    // Vérifier que l'utilisateur connecté est bien le destinataire de l'invitation
    if (invitation.receiver_id !== userId || invitation.receiver_type !== normalizedUserType) {
      throw new ForbiddenException('Cette invitation ne vous est pas destinée');
    }

    if (!invitation.canBeAccepted()) {
      throw new BadRequestException('Cette invitation ne peut plus être refusée');
    }

    invitation.status = InvitationSuiviStatus.DECLINED;
    invitation.responded_at = new Date();
    return this.invitationRepo.save(invitation);
  }

  /**
   * Annuler une invitation (sender uniquement)
   */
  async annulerInvitation(invitationId: number, senderId: number): Promise<void> {
    const invitation = await this.invitationRepo.findOne({ where: { id: invitationId }});
    if (!invitation) throw new NotFoundException('Invitation introuvable');

    if (invitation.sender_id !== senderId) {
      throw new ForbiddenException('Vous ne pouvez annuler que vos propres invitations');
    }

    if (invitation.status !== InvitationSuiviStatus.PENDING) {
      throw new BadRequestException('Seules les invitations en attente peuvent être annulées');
    }

    await this.invitationRepo.remove(invitation);
  }

  /**
   * Mes invitations envoyées
   */
  async getMesInvitationsEnvoyees(senderId: number, senderType: string, status?: InvitationSuiviStatus): Promise<InvitationSuivi[]> {
    return this.invitationSuiviRepository.findInvitationsEnvoyees(senderId, senderType, status);
  }

  /**
   * Mes invitations reçues
   */
  async getMesInvitationsRecues(userId: number, receiverType: string, status?: InvitationSuiviStatus): Promise<InvitationSuivi[]> {
    return this.invitationSuiviRepository.findInvitationsRecues(userId, receiverType, status);
  }

  /**
   * Compter mes invitations en attente
   */
  async countInvitationsPending(userId: number, receiverType: string): Promise<number> {
    return this.invitationSuiviRepository.countInvitationsPending(userId, receiverType);
  }
}
