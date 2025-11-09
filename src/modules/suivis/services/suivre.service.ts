// modules/suivis/services/suivre.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Suivre } from '../entities/suivre.entity';
import { SuivreRepository } from '../repositories/suivre.repository';
import { CreateSuiviDto, FollowedType } from '../dto/create-suivi.dto';
import { UpdateSuiviDto } from '../dto/update-suivi.dto';
import { UpgradeToAbonnementDto } from '../dto/upgrade-to-abonnement.dto';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { Abonnement, AbonnementStatut, AbonnementPlan } from '../entities/abonnement.entity';
import { PagePartenariat, VisibilitePagePartenariat } from '../../partenariats/entities/page-partenariat.entity';

@Injectable()
export class SuivreService {
  constructor(
    @InjectRepository(Suivre) private readonly suivreRepo: Repository<Suivre>,
    private readonly suivreRepository: SuivreRepository,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Societe) private readonly societeRepo: Repository<Societe>,
    @InjectRepository(Abonnement) private readonly abonnementRepo: Repository<Abonnement>,
    @InjectRepository(PagePartenariat) private readonly pagePartenaritRepo: Repository<PagePartenariat>,
    private dataSource: DataSource,
  ) {}

  /**
   * Suivre une entité (User ou Societe)
   */
  async suivre(userId: number, userType: string, createSuiviDto: CreateSuiviDto): Promise<Suivre> {
    // Vérifier que l'entité qui suit existe
    if (userType === 'User') {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('Utilisateur introuvable');
    } else {
      const societe = await this.societeRepo.findOne({ where: { id: userId } });
      if (!societe) throw new NotFoundException('Société introuvable');
    }

    // Vérifier que l'entité à suivre existe
    if (createSuiviDto.followed_type === FollowedType.USER) {
      const user = await this.userRepo.findOne({ where: { id: createSuiviDto.followed_id } });
      if (!user) throw new NotFoundException('Utilisateur cible introuvable');
      if (user.id === userId && userType === 'User') throw new BadRequestException('Vous ne pouvez pas vous suivre vous-même');
    } else {
      const societe = await this.societeRepo.findOne({ where: { id: createSuiviDto.followed_id } });
      if (!societe) throw new NotFoundException('Société cible introuvable');
      if (societe.id === userId && userType === 'Societe') throw new BadRequestException('Vous ne pouvez pas vous suivre vous-même');
    }

    // Vérifier si déjà suivi
    const exists = await this.suivreRepository.isSuivant(userId, userType, createSuiviDto.followed_id, createSuiviDto.followed_type);
    if (exists) throw new ConflictException('Vous suivez déjà cette entité');

    // Créer le suivi
    const suivre = this.suivreRepo.create({
      user_id: userId,
      user_type: userType,
      followed_id: createSuiviDto.followed_id,
      followed_type: createSuiviDto.followed_type,
      notifications_posts: createSuiviDto.notifications_posts ?? true,
      notifications_email: createSuiviDto.notifications_email ?? false,
    });

    return this.suivreRepo.save(suivre);
  }

  /**
   * Ne plus suivre
   */
  async unfollow(userId: number, userType: string, followedId: number, followedType: string): Promise<void> {
    const suivre = await this.suivreRepository.findSuivi(userId, userType, followedId, followedType);
    if (!suivre) throw new NotFoundException('Vous ne suivez pas cette entité');

    // Empêcher de ne plus suivre si abonnement actif
    if (suivre.abonnement && suivre.abonnement.statut === AbonnementStatut.ACTIVE) {
      throw new BadRequestException('Impossible avec un abonnement actif. Résiliez d\'abord l\'abonnement.');
    }

    await this.suivreRepo.remove(suivre);
  }

  /**
   * Mettre à jour les préférences
   */
  async updateSuivi(userId: number, userType: string, followedId: number, followedType: string, updateDto: UpdateSuiviDto): Promise<Suivre> {
    const suivre = await this.suivreRepository.findSuivi(userId, userType, followedId, followedType);
    if (!suivre) throw new NotFoundException('Suivi introuvable');
    Object.assign(suivre, updateDto);
    return this.suivreRepo.save(suivre);
  }

  /**
   * Marquer une visite
   */
  async marquerVisite(userId: number, userType: string, followedId: number, followedType: string): Promise<void> {
    const suivre = await this.suivreRepository.findSuivi(userId, userType, followedId, followedType);
    if (suivre) {
      suivre.marquerVisite();
      await this.suivreRepo.save(suivre);
    }
  }

  /**
   * Incrémenter les interactions
   */
  async incrementerInteraction(userId: number, userType: string, followedId: number, followedType: string, type: 'like' | 'commentaire' | 'partage'): Promise<void> {
    const suivre = await this.suivreRepository.findSuivi(userId, userType, followedId, followedType);
    if (suivre) {
      if (type === 'like') suivre.incrementerLike();
      else if (type === 'commentaire') suivre.incrementerCommentaire();
      else suivre.incrementerPartage();
      await this.suivreRepo.save(suivre);
    }
  }

  /**
   * Récupérer un suivi
   */
  async getSuivi(userId: number, userType: string, followedId: number, followedType: string): Promise<Suivre> {
    const suivre = await this.suivreRepository.findSuivi(userId, userType, followedId, followedType);
    if (!suivre) throw new NotFoundException('Suivi introuvable');
    return suivre;
  }

  /**
   * Récupérer les entités suivies par une entité (User ou Societe)
   */
  async getUserSuivis(userId: number, userType: string, type?: string): Promise<Suivre[]> {
    return this.suivreRepository.findUserSuivis(userId, userType, type);
  }

  /**
   * Récupérer les followers d'une entité
   */
  async getFollowers(followedId: number, followedType: string): Promise<Suivre[]> {
    return this.suivreRepository.findFollowers(followedId, followedType);
  }

  /**
   * Vérifier si suit
   */
  async isSuivant(userId: number, userType: string, followedId: number, followedType: string): Promise<boolean> {
    return this.suivreRepository.isSuivant(userId, userType, followedId, followedType);
  }

  /**
   * Upgrade vers abonnement (UNIQUEMENT si followed_type = Societe)
   * Crée automatiquement la PagePartenariat
   */
  async upgradeToAbonnement(userId: number, upgradeDto: UpgradeToAbonnementDto): Promise<{ abonnement: Abonnement; pagePartenariat: PagePartenariat }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Vérifier que le suivi existe et que c'est un User qui suit une Societe
      const suivre = await this.suivreRepository.findSuivi(userId, 'User', upgradeDto.societe_id, 'Societe');
      if (!suivre) throw new NotFoundException('Vous devez d\'abord suivre cette société');
      if (!suivre.peutUpgraderVersAbonnement()) throw new ConflictException('Vous avez déjà un abonnement');

      // Récupérer user et société
      const user = await this.userRepo.findOne({ where: { id: userId } });
      const societe = await this.societeRepo.findOne({ where: { id: upgradeDto.societe_id } });
      if (!user || !societe) throw new NotFoundException('User ou Société introuvable');

      // 1. Créer l'abonnement
      const abonnement = this.abonnementRepo.create({
        user_id: userId,
        societe_id: upgradeDto.societe_id,
        statut: AbonnementStatut.ACTIVE,
        plan_collaboration: upgradeDto.plan_collaboration || AbonnementPlan.STANDARD,
        secteur_collaboration: upgradeDto.secteur_collaboration || societe.secteur_activite,
        role_utilisateur: upgradeDto.role_utilisateur,
        date_debut: new Date(),
      });
      const savedAbonnement = await queryRunner.manager.save(abonnement);

      // 2. Créer la PagePartenariat
      const titreDefaut = `${societe.nom_societe} - ${user.prenom} ${user.nom}`;
      const pagePartenariat = this.pagePartenaritRepo.create({
        abonnement_id: savedAbonnement.id,
        titre: upgradeDto.titre_partenariat || titreDefaut,
        description: upgradeDto.description_partenariat || `Partenariat ${societe.nom_societe} et ${user.prenom} ${user.nom}`,
        secteur_activite: upgradeDto.secteur_collaboration || societe.secteur_activite,
        visibilite: VisibilitePagePartenariat.PRIVATE,
        date_debut_partenariat: new Date(),
      });
      const savedPagePartenariat = await queryRunner.manager.save(pagePartenariat);

      // 3. Mettre à jour l'abonnement
      savedAbonnement.page_partenariat_id = savedPagePartenariat.id;
      savedAbonnement.page_partenariat_creee = true;
      await queryRunner.manager.save(savedAbonnement);

      await queryRunner.commitTransaction();
      return { abonnement: savedAbonnement, pagePartenariat: savedPagePartenariat };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  getSocieteStats(societeId: number) { return this.suivreRepository.getSocieteStats(societeId); }
  getTopEngagedFollowers(followedId: number, followedType: string, limit = 10) { return this.suivreRepository.getTopEngagedFollowers(followedId, followedType, limit); }
  getPotentialUpgrades(societeId: number, minEngagement = 5) { return this.suivreRepository.getSuivisWithoutAbonnement(societeId, minEngagement); }
}
