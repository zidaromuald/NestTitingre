// modules/posts/controllers/commentaire.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CommentairePolymorphicService } from '../services/commentaire-polymorphic.service';
import { CreateCommentaireDto } from '../dto/create-commentaire.dto';
import { UpdateCommentaireDto } from '../dto/update-commentaire.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

@Controller('commentaires')
@UseGuards(JwtAuthGuard)
export class CommentaireController {
  constructor(
    private readonly commentairePolymorphicService: CommentairePolymorphicService,
  ) {}

  /**
   * Créer un commentaire sur un post
   * POST /commentaires
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCommentaireDto: CreateCommentaireDto,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const post =
      await this.commentairePolymorphicService['postRepository'].findOne({
        where: { id: createCommentaireDto.post_id },
      });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const commenter =
      currentUser instanceof User
        ? await this.commentairePolymorphicService['userRepository'].findOne({
            where: { id: currentUser.id },
          })
        : await this.commentairePolymorphicService[
            'societeRepository'
          ].findOne({
            where: { id: currentUser.id },
          });

    const commentaire = await this.commentairePolymorphicService.createCommentaire(
      post,
      commenter!,
      createCommentaireDto.contenu,
    );

    return {
      message: 'Commentaire créé avec succès',
      commentaire: {
        id: commentaire.id,
        post_id: commentaire.post_id,
        contenu: commentaire.contenu,
        created_at: commentaire.created_at,
      },
    };
  }

  /**
   * Récupérer tous les commentaires d'un post avec leurs auteurs
   * GET /commentaires/post/:postId
   */
  @Get('post/:postId')
  async getPostCommentaires(@Param('postId', ParseIntPipe) postId: number) {
    const commentairesWithAuthors =
      await this.commentairePolymorphicService.getCommentairesWithAuthors(
        postId,
      );

    const BASE_URL = 'https://api.titingre.com';

    return {
      total: commentairesWithAuthors.length,
      commentaires: commentairesWithAuthors.map((item) => {
        const isUser = item.commentaire.commentable_type === 'User';
        const authorAny = item.author as any;
        const profileUrl = authorAny.profile?.getPhotoUrl?.() ?? authorAny.profile?.getLogoUrl?.() ?? null;

        return {
          id: item.commentaire.id,
          contenu: item.commentaire.contenu,
          created_at: item.commentaire.created_at,
          updated_at: item.commentaire.updated_at,
          author: {
            id: item.author.id,
            type: item.commentaire.commentable_type,
            ...(isUser
              ? {
                  prenom: authorAny.prenom ?? '',
                  nom: authorAny.nom ?? '',
                }
              : {
                  nom_societe: authorAny.nom_societe ?? authorAny.nom ?? '',
                }),
            photo_url: profileUrl ? `${BASE_URL}${profileUrl}` : null,
          },
        };
      }),
    };
  }

  /**
   * Modifier un commentaire
   * PUT /commentaires/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentaireDto: UpdateCommentaireDto,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const commentaire =
      await this.commentairePolymorphicService['commentaireRepository'].findOne(
        {
          where: { id },
        },
      );

    if (!commentaire) {
      throw new NotFoundException('Commentaire not found');
    }

    const commenter =
      currentUser instanceof User
        ? await this.commentairePolymorphicService['userRepository'].findOne({
            where: { id: currentUser.id },
          })
        : await this.commentairePolymorphicService[
            'societeRepository'
          ].findOne({
            where: { id: currentUser.id },
          });

    const canEdit = this.commentairePolymorphicService.canEditCommentaire(
      commentaire,
      commenter!,
    );

    if (!canEdit) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier ce commentaire',
      );
    }

    const updated = await this.commentairePolymorphicService.updateCommentaire(
      id,
      updateCommentaireDto.contenu,
    );

    return {
      message: 'Commentaire modifié avec succès',
      commentaire: {
        id: updated.id,
        contenu: updated.contenu,
        updated_at: updated.updated_at,
      },
    };
  }

  /**
   * Supprimer un commentaire
   * DELETE /commentaires/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const commentaire =
      await this.commentairePolymorphicService['commentaireRepository'].findOne(
        {
          where: { id },
        },
      );

    if (!commentaire) {
      throw new NotFoundException('Commentaire not found');
    }

    const commenter =
      currentUser instanceof User
        ? await this.commentairePolymorphicService['userRepository'].findOne({
            where: { id: currentUser.id },
          })
        : await this.commentairePolymorphicService[
            'societeRepository'
          ].findOne({
            where: { id: currentUser.id },
          });

    const canEdit = this.commentairePolymorphicService.canEditCommentaire(
      commentaire,
      commenter!,
    );

    if (!canEdit) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer ce commentaire',
      );
    }

    await this.commentairePolymorphicService.removeCommentaire(commentaire);

    return {
      message: 'Commentaire supprimé avec succès',
    };
  }

  /**
   * Récupérer les commentaires de l'utilisateur connecté
   * GET /commentaires/my-comments
   */
  @Get('my-comments')
  async getMyComments(@CurrentUser() currentUser: User | Societe) {
    const commentaires =
      currentUser instanceof User
        ? await this.commentairePolymorphicService.getCommentairesByUser(
            currentUser.id,
          )
        : await this.commentairePolymorphicService.getCommentairesBySociete(
            currentUser.id,
          );

    return {
      total: commentaires.length,
      commentaires: commentaires.map((commentaire) => ({
        id: commentaire.id,
        post_id: commentaire.post_id,
        contenu: commentaire.contenu,
        created_at: commentaire.created_at,
        updated_at: commentaire.updated_at,
      })),
    };
  }

  /**
   * Récupérer les posts commentés par l'utilisateur
   * GET /commentaires/my-commented-posts
   */
  @Get('my-commented-posts')
  async getMyCommentedPosts(@CurrentUser() currentUser: User | Societe) {
    const posts =
      currentUser instanceof User
        ? await this.commentairePolymorphicService.getCommentedPostsByUser(
            currentUser.id,
          )
        : await this.commentairePolymorphicService.getCommentedPostsBySociete(
            currentUser.id,
          );

    return {
      total: posts.length,
      posts: posts.map((post) => ({
        id: post.id,
        contenu: post.contenu.substring(0, 100) + '...',
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        created_at: post.created_at,
      })),
    };
  }
}
