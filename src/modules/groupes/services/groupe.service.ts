// modules/groupes/services/groupe.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GroupeRepository } from '../repositories/groupe.repository';
import { MembreRole } from '../entities/groupe.entity';
import { GroupeUser } from '../entities/groupe-user.entity';
import { GroupeInvitation, InvitationStatus } from '../entities/groupe-invitation.entity';
import { GroupeProfil } from '../entities/groupe-profil.entity';
import { GroupePolymorphicService } from './groupe-polymorphic.service';
import { GroupeMapper } from '../mappers/groupe.mapper';
import { CreateGroupeDto } from '../dto/create-groupe.dto';
import { UpdateGroupeDto } from '../dto/update-groupe.dto';
import { InviteMembreDto } from '../dto/invite-membre.dto';
import { UpdateMembreRoleDto } from '../dto/update-membre-role.dto';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Societe)
    private readonly societeRepository: Repository<Societe>,
    private readonly groupePolymorphicService: GroupePolymorphicService,
    private readonly groupeMapper: GroupeMapper,
  ) {}

  async create(createGroupeDto: CreateGroupeDto, creator: { id: number; type: string }) {
    console.log('🔍 Service create - DTO:', createGroupeDto);
    console.log('🔍 Service create - Creator:', creator);

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

    console.log('🔍 Groupe object before save:', groupe);

    const savedGroupe = await this.groupeRepository.save(groupe);
    console.log('✅ Groupe saved:', savedGroupe);

    const profil = this.groupeProfilRepository.create({ groupe_id: savedGroupe.id });
    await this.groupeProfilRepository.save(profil);
    console.log('✅ Profil created');

    // Ajouter le créateur (User OU Societe) comme admin membre du groupe
    await this.groupeUserRepository.save(
      this.groupeUserRepository.create({
        groupe_id: savedGroupe.id,
        member_id: creator.id,
        member_type: creator.type,
        role: MembreRole.ADMIN,
      }),
    );
    console.log(`✅ ${creator.type} added as admin`);

    return { message: 'Groupe créé avec succès', groupe: this.groupeMapper.toPublicData(savedGroupe, 1) };
  }

  async findOne(groupeId: number, userId?: number, userType: string = 'User') {
    const groupe = await this.groupeRepository.findOne({ where: { id: groupeId }, relations: ['profil'] });
    if (!groupe) throw new NotFoundException('Groupe non trouvé');
    const membresCount = await this.groupeRepository.countMembres(groupeId);
    const creator = await this.groupePolymorphicService.getCreateur(groupe);
    const userRole = userId ? await this.groupeRepository.getMembreRole(groupeId, userId, userType) : null;
    return { ...this.groupeMapper.toDetailedData(groupe, membresCount, groupe.profil, creator), userRole };
  }

  async update(groupeId: number, updateGroupeDto: UpdateGroupeDto, userId: number, userType: string = 'User') {
    const groupe = await this.groupeRepository.findOne({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe non trouvé');
    const role = await this.groupeRepository.getMembreRole(groupeId, userId, userType);
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

  async getUserGroupes(userId: number, userType: string = 'User') {
    const groupes = await this.groupeRepository.findByUserId(userId, userType);
    const result = await Promise.all(groupes.map(async (groupe) => {
      // Vérifier si l'utilisateur est le créateur du groupe
      const isCreator = groupe.created_by_id === userId && groupe.created_by_type === userType;
      // Vérifier si l'utilisateur est l'admin désigné
      const isDesignatedAdmin = groupe.admin_user_id === userId;

      // Récupérer le rôle depuis groupe_users
      let myRole = await this.groupeRepository.getMembreRole(groupe.id, userId, userType);

      // Si le créateur ou admin désigné, forcer le rôle à 'admin'
      if (isCreator || isDesignatedAdmin) {
        myRole = 'admin';
      }

      return {
        ...this.groupeMapper.toPublicData(groupe, await this.groupeRepository.countMembres(groupe.id)),
        myRole,
      };
    }));
    return { total: result.length, groupes: result };
  }

  async getCreatedGroupes(creatorId: number, creatorType: string) {
    const groupes = await this.groupeRepository.findByCreator(creatorId, creatorType);
    const result = await Promise.all(groupes.map(async (groupe) => {
      const membresCount = await this.groupeRepository.countMembres(groupe.id);
      return {
        ...this.groupeMapper.toPublicData(groupe, membresCount),
        myRole: 'admin',
      };
    }));
    return { total: result.length, groupes: result };
  }

  async getMembres(groupeId: number) {
    const groupeUsers = await this.groupeUserRepository.find({ where: { groupe_id: groupeId }, relations: ['user', 'user.profile'], order: { joined_at: 'DESC' } });
    return { total: groupeUsers.length, membres: groupeUsers.map((gu) => this.groupeMapper.toMembreData(gu, gu.user)) };
  }

  async inviteMembre(groupeId: number, inviteDto: InviteMembreDto, inviter: { id: number; type: string }) {
    const groupe = await this.groupeRepository.findOne({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe non trouvé');

    // Vérifier si l'inviteur a le droit d'inviter
    let canInvite = false;

    // Si c'est un User: vérifier si admin désigné OU membre du groupe
    if (inviter.type === 'User') {
      const isAdminDesigne = groupe.admin_user_id === inviter.id;
      const isMembre = await this.groupeRepository.isUserMembre(groupeId, inviter.id);
      canInvite = isAdminDesigne || isMembre;
    }

    // Si c'est une Societe: vérifier si c'est le créateur OU membre du groupe
    if (inviter.type === 'Societe') {
      const isCreateur = groupe.created_by_type === 'Societe' && groupe.created_by_id === inviter.id;
      const isMembre = await this.groupeUserRepository.findOne({
        where: { groupe_id: groupeId, member_id: inviter.id, member_type: 'Societe' }
      });
      canInvite = isCreateur || !!isMembre;
    }

    if (!canInvite) {
      throw new ForbiddenException('Seuls les membres ou le créateur du groupe peuvent inviter');
    }

    // Vérifier si le user est déjà membre
    const existingMember = await this.groupeUserRepository.findOne({
      where: { groupe_id: groupeId, member_id: inviteDto.invitedId, member_type: inviteDto.invitedType }
    });

    if (existingMember) {
      throw new BadRequestException('Cet utilisateur est déjà membre du groupe');
    }

    // Si le groupe est créé par une société ET que l'inviteur est la société
    if (groupe.created_by_type === 'Societe' && inviter.type === 'Societe' && inviter.id === groupe.created_by_id) {
      // Vérifier que le User est abonné
      const isAbonne = await this.groupeRepository.manager.query(
        `SELECT COUNT(*) as count FROM abonnements
         WHERE user_id = $1 AND societe_id = $2 AND statut = 'active'`,
        [inviteDto.invitedId, groupe.created_by_id]
      );

      if (parseInt(isAbonne[0]?.count || '0') === 0) {
        throw new ForbiddenException('Seuls les abonnés de la société peuvent être ajoutés dans ce groupe');
      }

      // Ajouter directement le user au groupe (sans invitation)
      const roleToAssign = inviteDto.role || MembreRole.MEMBRE;
      await this.groupeUserRepository.save(
        this.groupeUserRepository.create({
          groupe_id: groupeId,
          member_id: inviteDto.invitedId,
          member_type: inviteDto.invitedType,
          role: roleToAssign
        })
      );

      return {
        message: `Utilisateur ajouté directement au groupe avec le rôle ${roleToAssign}`,
        ajoutDirect: true,
        role: roleToAssign
      };
    }

    // Pour les autres cas (User inviteur ou groupe non créé par une Société), créer une invitation
    const invitation = await this.groupeInvitationRepository.save(
      this.groupeInvitationRepository.create({
        groupe_id: groupeId,
        invited_id: inviteDto.invitedId,
        invited_type: inviteDto.invitedType,
        inviter_id: inviter.id,
        inviter_type: inviter.type,
        message: inviteDto.message,
        role: inviteDto.role || MembreRole.MEMBRE,
        status: InvitationStatus.PENDING,
      }),
    );
    return { message: 'Invitation envoyée', invitation };
  }

  async acceptInvitation(invitationId: number, userId: number) {
    const invitation = await this.groupeInvitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) throw new NotFoundException('Invitation non trouvée');
    if (invitation.invited_id !== userId) throw new ForbiddenException('Invitation non destinée');
    if (invitation.status !== InvitationStatus.PENDING) throw new BadRequestException('Invitation non valide');

    // Utiliser le rôle stocké dans l'invitation
    const roleToAssign = invitation.role || MembreRole.MEMBRE;
    await this.groupeUserRepository.save(
      this.groupeUserRepository.create({
        groupe_id: invitation.groupe_id,
        member_id: userId,
        member_type: 'User',
        role: roleToAssign
      })
    );

    invitation.status = InvitationStatus.ACCEPTED;
    invitation.accepted_at = new Date();
    await this.groupeInvitationRepository.save(invitation);
    return { message: 'Invitation acceptée', role: roleToAssign };
  }

  async declineInvitation(invitationId: number, userId: number) {
    const invitation = await this.groupeInvitationRepository.findOne({ where: { id: invitationId } });
    if (!invitation) throw new NotFoundException('Invitation non trouvée');
    if (invitation.invited_id !== userId) throw new ForbiddenException('Invitation non destinée');
    invitation.status = InvitationStatus.DECLINED;
    invitation.accepted_at = new Date();
    await this.groupeInvitationRepository.save(invitation);
    return { message: 'Invitation refusée' };
  }

  async leaveGroupe(groupeId: number, userId: number, userType: string = 'User') {
    if (!(await this.groupeRepository.isMembre(groupeId, userId, userType))) throw new BadRequestException('Non membre');
    await this.groupeUserRepository.delete({ groupe_id: groupeId, member_id: userId, member_type: userType });
    return { message: 'Groupe quitté' };
  }

  async updateMembreRole(groupeId: number, targetUserId: number, updateRoleDto: UpdateMembreRoleDto, adminUserId: number, adminType: string = 'User') {
    if ((await this.groupeRepository.getMembreRole(groupeId, adminUserId, adminType)) !== MembreRole.ADMIN) throw new ForbiddenException('Admin uniquement');
    const groupeUser = await this.groupeUserRepository.findOne({ where: { groupe_id: groupeId, member_id: targetUserId, member_type: 'User' } });
    if (!groupeUser) throw new NotFoundException('Membre non trouvé');
    groupeUser.role = updateRoleDto.role;
    await this.groupeUserRepository.save(groupeUser);
    return { message: 'Rôle mis à jour' };
  }

  /**
   * Supprimer un groupe (admin uniquement)
   */
  async deleteGroupe(groupeId: number, userId: number, userType: string = 'User') {
    const groupe = await this.groupeRepository.findOne({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe non trouvé');

    const role = await this.groupeRepository.getMembreRole(groupeId, userId, userType);
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
        member_id: userId,
        member_type: 'User',
        role: MembreRole.MEMBRE,
      }),
    );

    return { message: 'Vous avez rejoint le groupe avec succès' };
  }

  /**
   * Expulser un membre du groupe (admin uniquement)
   */
  async removeMembre(groupeId: number, targetUserId: number, adminUserId: number, adminType: string = 'User') {
    const role = await this.groupeRepository.getMembreRole(groupeId, adminUserId, adminType);
    if (role !== MembreRole.ADMIN) {
      throw new ForbiddenException('Seuls les admins peuvent expulser des membres');
    }

    // Vérifier que le membre existe
    const groupeUser = await this.groupeUserRepository.findOne({
      where: { groupe_id: groupeId, member_id: targetUserId, member_type: 'User' },
    });
    if (!groupeUser) throw new NotFoundException('Membre non trouvé');

    // Ne pas permettre l'expulsion d'un admin par un autre admin
    if (groupeUser.role === MembreRole.ADMIN && adminUserId !== targetUserId) {
      throw new ForbiddenException('Impossible d\'expulser un administrateur');
    }

    await this.groupeUserRepository.delete({ groupe_id: groupeId, member_id: targetUserId, member_type: 'User' });
    return { message: 'Membre expulsé avec succès' };
  }

  /**
   * Suspendre un membre (admin uniquement)
   */
  async suspendMembre(groupeId: number, targetUserId: number, adminUserId: number, adminType: string = 'User') {
    const role = await this.groupeRepository.getMembreRole(groupeId, adminUserId, adminType);
    if (role !== MembreRole.ADMIN) {
      throw new ForbiddenException('Seuls les admins peuvent suspendre des membres');
    }

    const groupeUser = await this.groupeUserRepository.findOne({
      where: { groupe_id: groupeId, member_id: targetUserId, member_type: 'User' },
    });
    if (!groupeUser) throw new NotFoundException('Membre non trouvé');

    // Ne pas permettre la suspension d'un admin
    if (groupeUser.role === MembreRole.ADMIN) {
      throw new ForbiddenException('Impossible de suspendre un administrateur');
    }

    // Note: La table groupe_users n'a pas de champ status
    // Pour l'instant, on supprime simplement le membre (comme une suspension)
    await this.groupeUserRepository.delete({ groupe_id: groupeId, member_id: targetUserId, member_type: 'User' });

    return { message: 'Membre suspendu avec succès' };
  }

  /**
   * Bannir un membre définitivement (admin uniquement)
   */
  async banMembre(groupeId: number, targetUserId: number, adminUserId: number, adminType: string = 'User') {
    const role = await this.groupeRepository.getMembreRole(groupeId, adminUserId, adminType);
    if (role !== MembreRole.ADMIN) {
      throw new ForbiddenException('Seuls les admins peuvent bannir des membres');
    }

    const groupeUser = await this.groupeUserRepository.findOne({
      where: { groupe_id: groupeId, member_id: targetUserId, member_type: 'User' },
    });
    if (!groupeUser) throw new NotFoundException('Membre non trouvé');

    // Ne pas permettre le bannissement d'un admin
    if (groupeUser.role === MembreRole.ADMIN) {
      throw new ForbiddenException('Impossible de bannir un administrateur');
    }

    // Note: La table groupe_users n'a pas de champ status
    // Pour l'instant, on supprime simplement le membre (comme un bannissement)
    await this.groupeUserRepository.delete({ groupe_id: groupeId, member_id: targetUserId, member_type: 'User' });

    return { message: 'Membre banni avec succès' };
  }

  /**
   * Récupérer les invitations reçues par un utilisateur
   */
  async getMyInvitations(userId: number) {
    const invitations = await this.groupeInvitationRepository.find({
      where: { invited_id: userId, status: InvitationStatus.PENDING },
      relations: ['groupe', 'invitedByUser'],
      order: { created_at: 'DESC' },
    });

    // Collecter les IDs de Societe inviters pour les charger en batch
    const societeInviterIds = invitations
      .filter(inv => inv.inviter_type === 'Societe')
      .map(inv => inv.inviter_id);

    // Charger les Societes en une seule requête
    const societeMap = new Map<number, Societe>();
    if (societeInviterIds.length > 0) {
      const societes = await this.societeRepository.findBy({ id: In(societeInviterIds) });
      societes.forEach(s => societeMap.set(s.id, s));
    }

    const result = await Promise.all(
      invitations.map(async (invitation) => {
        const groupe = invitation.groupe;
        const membresCount = await this.groupeRepository.countMembres(groupe.id);

        // Construire les informations de l'inviter
        let inviter: { id: number; type: string; nom?: string; prenom?: string; nom_societe?: string };
        if (invitation.inviter_type === 'User' && invitation.invitedByUser) {
          inviter = {
            id: invitation.invitedByUser.id,
            nom: invitation.invitedByUser.nom,
            prenom: invitation.invitedByUser.prenom,
            type: 'User',
          };
        } else if (invitation.inviter_type === 'Societe') {
          const societe = societeMap.get(invitation.inviter_id);
          inviter = {
            id: invitation.inviter_id,
            type: 'Societe',
            nom_societe: societe?.nom_societe,
          };
        } else {
          inviter = {
            id: invitation.inviter_id,
            type: invitation.inviter_type,
          };
        }

        return {
          id: invitation.id,
          message: invitation.message,
          created_at: invitation.created_at,
          groupe: this.groupeMapper.toPublicData(groupe, membresCount),
          inviter_id: invitation.inviter_id,
          inviter_type: invitation.inviter_type,
          inviter,
        };
      }),
    );

    return { total: result.length, invitations: result };
  }

  /**
   * Récupérer les invitations envoyées par un utilisateur ou une société
   */
  async getMySentInvitations(inviterId: number, inviterType: string) {
    const invitations = await this.groupeInvitationRepository.find({
      where: { inviter_id: inviterId, inviter_type: inviterType },
      relations: ['groupe', 'invitedUser'],
      order: { created_at: 'DESC' },
    });

    const result = await Promise.all(
      invitations.map(async (invitation) => {
        const groupe = invitation.groupe;
        const membresCount = await this.groupeRepository.countMembres(groupe.id);

        // Construire les informations de l'invité
        let invitedUser: { id: number; type: string; nom?: string; prenom?: string } | undefined;
        if (invitation.invitedUser) {
          invitedUser = {
            id: invitation.invitedUser.id,
            nom: invitation.invitedUser.nom,
            prenom: invitation.invitedUser.prenom,
            type: 'User',
          };
        }

        return {
          id: invitation.id,
          message: invitation.message,
          status: invitation.status,
          created_at: invitation.created_at,
          accepted_at: invitation.accepted_at,
          groupe: this.groupeMapper.toPublicData(groupe, membresCount),
          invited_id: invitation.invited_id,
          invited_type: invitation.invited_type,
          invitedUser,
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
    userType: string = 'User',
  ) {
    const groupe = await this.groupeRepository.findOne({ where: { id: groupeId } });
    if (!groupe) throw new NotFoundException('Groupe non trouvé');

    const role = await this.groupeRepository.getMembreRole(groupeId, userId, userType);
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
