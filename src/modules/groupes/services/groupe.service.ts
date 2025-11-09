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
}
