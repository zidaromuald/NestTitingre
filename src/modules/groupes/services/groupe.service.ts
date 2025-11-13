// modules/groupes/services/groupe.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupeRepository } from '../repositories/groupe.repository';
import { MembreRole, MembreStatus } from '../entities/groupe.entity';
import { GroupeUser } from '../entities/groupe-user.entity';
import { GroupeInvitation, InvitationStatus } from '../entities/groupe-invitation.entity';
import { GroupeProfil } from '../entities/groupe-profil.entity';
import { GroupePolymorphicService } from './groupe-polymorphic.service';
import { GroupeMapper } from '../mappers/groupe.mapper';
import { CreateGroupeDto } from '../dto/create-groupe.dto';
import { UpdateGroupeDto } from '../dto/update-groupe.dto';
import { InviteMembreDto } from '../dto/invite-membre.dto';
import { UpdateMembreRoleDto } from '../dto/update-membre-role.dto';

@Injectable()
export class GroupeService {
  constructor(
    @InjectRepository(GroupeRepository)
    private readonly groupeRepository: GroupeRepository,
    @InjectRepository(GroupeUser)
    private readonly groupeUserRepository: Repository<GroupeUser>,
    @InjectRepository(GroupeInvitation)
    private readonly groupeInvitationRepository: Repository<GroupeInvitation>,
    @InjectRepository(GroupeProfil)
    private readonly groupeProfilRepository: Repository<GroupeProfil>,
    private readonly groupePolymorphicService: GroupePolymorphicService,
    private readonly groupeMapper: GroupeMapper,
  ) {}

  async create(createGroupeDto: CreateGroupeDto, creator: { id: number; type: string }) {
    const groupe = this.groupeRepository.create({
      nom: createGroupeDto.nom,
      description: createGroupeDto.description,
      type: createGroupeDto.type,
      max_membres: createGroupeDto.maxMembres || 50,
      categorie: createGroupeDto.categorie,
      created_by_id: creator.id,
      created_by_type: creator.type,
      admin_user_id: createGroupeDto.adminUserId,
    });
    const savedGroupe = await this.groupeRepository.save(groupe);
    const profil = this.groupeProfilRepository.create({ groupe_id: savedGroupe.id });
    await this.groupeProfilRepository.save(profil);
    if (creator.type === 'User') {
      await this.groupeUserRepository.save(
        this.groupeUserRepository.create({
          groupe_id: savedGroupe.id,
          user_id: creator.id,
          role: MembreRole.ADMIN,
          status: MembreStatus.ACTIVE,
        }),
      );
    }
    return { message: 'Groupe créé avec succès', groupe: this.groupeMapper.toPublicData(savedGroupe, 1) };
  }

  async findOne(groupeId: number, userId?: number) {
    const groupe = await this.groupeRepository.findOne({ where: { id: groupeId }, relations: ['profil'] });
    if (!groupe) throw new NotFoundException('Groupe non trouvé');
    const membresCount = await this.groupeRepository.countMembres(groupeId);
    const creator = await this.groupePolymorphicService.getCreateur(groupe);
    const userRole = userId ? await this.groupeRepository.getMembreRole(groupeId, userId) : null;
    return { ...this.groupeMapper.toDetailedData(groupe, membresCount, groupe.profil, creator), userRole };
  }

  async update(groupeId: number, updateGroupeDto: UpdateGroupeDto, userId: number) {
    const groupe = await this.groupeRepository.findOne({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe non trouvé');
    const role = await this.groupeRepository.getMembreRole(groupeId, userId);
    if (role !== MembreRole.ADMIN) throw new ForbiddenException('Seuls les admins peuvent modifier');
    Object.assign(groupe, { ...(updateGroupeDto.nom && { nom: updateGroupeDto.nom }), ...(updateGroupeDto.description !== undefined && { description: updateGroupeDto.description }) });
    await this.groupeRepository.save(groupe);
    const membresCount = await this.groupeRepository.countMembres(groupeId);
    return { message: 'Groupe mis à jour', groupe: this.groupeMapper.toPublicData(groupe, membresCount) };
  }

  async search(query: string, limit: number = 20) {
    const groupes = await this.groupeRepository.searchByNom(query, limit);
    const membresCountMap = new Map<number, number>();
    for (const groupe of groupes) {
      membresCountMap.set(groupe.id, await this.groupeRepository.countMembres(groupe.id));
    }
    return this.groupeMapper.toSearchResults(groupes, groupes.length, membresCountMap);
  }

  async getUserGroupes(userId: number) {
    const groupes = await this.groupeRepository.findByUserId(userId);
    const result = await Promise.all(groupes.map(async (groupe) => ({
      ...this.groupeMapper.toPublicData(groupe, await this.groupeRepository.countMembres(groupe.id)),
      myRole: await this.groupeRepository.getMembreRole(groupe.id, userId),
    })));
    return { total: result.length, groupes: result };
  }

  async getMembres(groupeId: number) {
    const groupeUsers = await this.groupeUserRepository.find({ where: { groupe_id: groupeId }, relations: ['user'], order: { joined_at: 'DESC' } });
    return { total: groupeUsers.length, membres: groupeUsers.map((gu) => this.groupeMapper.toMembreData(gu, gu.user)) };
  }

  async inviteMembre(groupeId: number, inviteDto: InviteMembreDto, invitedByUserId: number) {
    const groupe = await this.groupeRepository.findOne({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe non trouvé');
    if (!(await this.groupeRepository.isUserMembre(groupeId, invitedByUserId))) throw new ForbiddenException('Seuls les membres peuvent inviter');
    const invitation = await this.groupeInvitationRepository.save(
      this.groupeInvitationRepository.create({
        groupe_id: groupeId,
        invited_user_id: inviteDto.userId,
        invited_by_user_id: invitedByUserId,
        message: inviteDto.message,
        status: InvitationStatus.PENDING,
      }),
    );
    return { message: 'Invitation envoyée', invitation };
  }

  async acceptInvitation(invitationId: number, userId: number) {
    const invitation = await this.groupeInvitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) throw new NotFoundException('Invitation non trouvée');
    if (invitation.invited_user_id !== userId) throw new ForbiddenException('Invitation non destinée');
    if (invitation.status !== InvitationStatus.PENDING) throw new BadRequestException('Invitation non valide');
    await this.groupeUserRepository.save(this.groupeUserRepository.create({ groupe_id: invitation.groupe_id, user_id: userId, role: MembreRole.MEMBRE, status: MembreStatus.ACTIVE }));
    invitation.status = InvitationStatus.ACCEPTED;
    invitation.responded_at = new Date();
    await this.groupeInvitationRepository.save(invitation);
    return { message: 'Invitation acceptée' };
  }

  async declineInvitation(invitationId: number, userId: number) {
    const invitation = await this.groupeInvitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) throw new NotFoundException('Invitation non trouvée');
    if (invitation.invited_user_id !== userId) throw new ForbiddenException('Invitation non destinée');
    invitation.status = InvitationStatus.DECLINED;
    invitation.responded_at = new Date();
    await this.groupeInvitationRepository.save(invitation);
    return { message: 'Invitation refusée' };
  }

  async leaveGroupe(groupeId: number, userId: number) {
    if (!(await this.groupeRepository.isUserMembre(groupeId, userId))) throw new BadRequestException('Non membre');
    await this.groupeUserRepository.delete({ groupe_id: groupeId, user_id: userId });
    return { message: 'Groupe quitté' };
  }

  async updateMembreRole(groupeId: number, targetUserId: number, updateRoleDto: UpdateMembreRoleDto, adminUserId: number) {
    if ((await this.groupeRepository.getMembreRole(groupeId, adminUserId)) !== MembreRole.ADMIN) throw new ForbiddenException('Admin uniquement');
    const groupeUser = await this.groupeUserRepository.findOne({ where: { groupe_id: groupeId, user_id: targetUserId } });
    if (!groupeUser) throw new NotFoundException('Membre non trouvé');
    groupeUser.role = updateRoleDto.role;
    await this.groupeUserRepository.save(groupeUser);
    return { message: 'Rôle mis à jour' };
  }

  /**
   * Supprimer un groupe (admin uniquement)
   */
  async deleteGroupe(groupeId: number, userId: number) {
    const groupe = await this.groupeRepository.findOne({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe non trouvé');

    const role = await this.groupeRepository.getMembreRole(groupeId, userId);
    if (role !== MembreRole.ADMIN) {
      throw new ForbiddenException('Seuls les admins peuvent supprimer le groupe');
    }

    // Supprimer les relations avant le groupe
    await this.groupeUserRepository.delete({ groupe_id: groupeId });
    await this.groupeInvitationRepository.delete({ groupe_id: groupeId });
    await this.groupeProfilRepository.delete({ groupe_id: groupeId });
    await this.groupeRepository.delete(groupeId);

    return { message: 'Groupe supprimé avec succès' };
  }

  /**
   * Rejoindre un groupe public (sans invitation)
   */
  async joinGroupe(groupeId: number, userId: number) {
    const groupe = await this.groupeRepository.findOne({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe non trouvé');

    // Vérifier que le groupe est public
    if (groupe.type !== 'public') {
      throw new ForbiddenException('Ce groupe nécessite une invitation');
    }

    // Vérifier si déjà membre
    const isMembre = await this.groupeRepository.isUserMembre(groupeId, userId);
    if (isMembre) {
      throw new BadRequestException('Vous êtes déjà membre de ce groupe');
    }

    // Vérifier si le groupe est plein
    const membresCount = await this.groupeRepository.countMembres(groupeId);
    if (groupe.isFull(membresCount)) {
      throw new BadRequestException('Le groupe est complet');
    }

    // Ajouter le membre
    await this.groupeUserRepository.save(
      this.groupeUserRepository.create({
        groupe_id: groupeId,
        user_id: userId,
        role: MembreRole.MEMBRE,
        status: MembreStatus.ACTIVE,
      }),
    );

    return { message: 'Vous avez rejoint le groupe avec succès' };
  }

  /**
   * Expulser un membre du groupe (admin uniquement)
   */
  async removeMembre(groupeId: number, targetUserId: number, adminUserId: number) {
    const role = await this.groupeRepository.getMembreRole(groupeId, adminUserId);
    if (role !== MembreRole.ADMIN) {
      throw new ForbiddenException('Seuls les admins peuvent expulser des membres');
    }

    // Vérifier que le membre existe
    const groupeUser = await this.groupeUserRepository.findOne({
      where: { groupe_id: groupeId, user_id: targetUserId },
    });
    if (!groupeUser) throw new NotFoundException('Membre non trouvé');

    // Ne pas permettre l'expulsion d'un admin par un autre admin
    if (groupeUser.role === MembreRole.ADMIN && adminUserId !== targetUserId) {
      throw new ForbiddenException('Impossible d\'expulser un administrateur');
    }

    await this.groupeUserRepository.delete({ groupe_id: groupeId, user_id: targetUserId });
    return { message: 'Membre expulsé avec succès' };
  }

  /**
   * Suspendre un membre (admin uniquement)
   */
  async suspendMembre(groupeId: number, targetUserId: number, adminUserId: number) {
    const role = await this.groupeRepository.getMembreRole(groupeId, adminUserId);
    if (role !== MembreRole.ADMIN) {
      throw new ForbiddenException('Seuls les admins peuvent suspendre des membres');
    }

    const groupeUser = await this.groupeUserRepository.findOne({
      where: { groupe_id: groupeId, user_id: targetUserId },
    });
    if (!groupeUser) throw new NotFoundException('Membre non trouvé');

    // Ne pas permettre la suspension d'un admin
    if (groupeUser.role === MembreRole.ADMIN) {
      throw new ForbiddenException('Impossible de suspendre un administrateur');
    }

    groupeUser.status = MembreStatus.SUSPENDED;
    await this.groupeUserRepository.save(groupeUser);

    return { message: 'Membre suspendu avec succès' };
  }

  /**
   * Bannir un membre définitivement (admin uniquement)
   */
  async banMembre(groupeId: number, targetUserId: number, adminUserId: number) {
    const role = await this.groupeRepository.getMembreRole(groupeId, adminUserId);
    if (role !== MembreRole.ADMIN) {
      throw new ForbiddenException('Seuls les admins peuvent bannir des membres');
    }

    const groupeUser = await this.groupeUserRepository.findOne({
      where: { groupe_id: groupeId, user_id: targetUserId },
    });
    if (!groupeUser) throw new NotFoundException('Membre non trouvé');

    // Ne pas permettre le bannissement d'un admin
    if (groupeUser.role === MembreRole.ADMIN) {
      throw new ForbiddenException('Impossible de bannir un administrateur');
    }

    groupeUser.status = MembreStatus.BANNED;
    await this.groupeUserRepository.save(groupeUser);

    return { message: 'Membre banni avec succès' };
  }

  /**
   * Récupérer les invitations reçues par un utilisateur
   */
  async getMyInvitations(userId: number) {
    const invitations = await this.groupeInvitationRepository.find({
      where: { invited_user_id: userId, status: InvitationStatus.PENDING },
      relations: ['groupe'],
      order: { created_at: 'DESC' },
    });

    const result = await Promise.all(
      invitations.map(async (invitation) => {
        const groupe = invitation.groupe;
        const membresCount = await this.groupeRepository.countMembres(groupe.id);
        return {
          id: invitation.id,
          message: invitation.message,
          created_at: invitation.created_at,
          groupe: this.groupeMapper.toPublicData(groupe, membresCount),
          invited_by_user_id: invitation.invited_by_user_id,
        };
      }),
    );

    return { total: result.length, invitations: result };
  }

  /**
   * Mettre à jour le profil d'un groupe (admin uniquement)
   */
  async updateProfil(
    groupeId: number,
    updateData: {
      photo_couverture?: string;
      photo_profil?: string;
      description_detaillee?: string;
      regles?: string;
      lien_externe?: string;
      couleur_theme?: string;
    },
    userId: number,
  ) {
    const groupe = await this.groupeRepository.findOne({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe non trouvé');

    const role = await this.groupeRepository.getMembreRole(groupeId, userId);
    if (role !== MembreRole.ADMIN) {
      throw new ForbiddenException('Seuls les admins peuvent modifier le profil');
    }

    const profil = await this.groupeProfilRepository.findOne({ where: { groupe_id: groupeId } });
    if (!profil) throw new NotFoundException('Profil du groupe non trouvé');

    Object.assign(profil, updateData);
    await this.groupeProfilRepository.save(profil);

    return { message: 'Profil mis à jour avec succès', profil };
  }
}
