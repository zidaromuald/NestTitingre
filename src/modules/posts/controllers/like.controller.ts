// modules/posts/controllers/like.controller.ts
import {
  Controller,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LikePolymorphicService } from '../services/like-polymorphic.service';
import { PostPolymorphicService } from '../services/post-polymorphic.service';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('likes')
// @UseGuards(JwtAuthGuard) // Décommenter quand le guard sera prêt
export class LikeController {
  constructor(
    private readonly likePolymorphicService: LikePolymorphicService,
    private readonly postPolymorphicService: PostPolymorphicService,
  ) {}

  /**
   * Liker un post
   * POST /likes/post/:postId
   */
  @Post('post/:postId')
  @HttpCode(HttpStatus.CREATED)
  async likePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req: any,
  ) {
    // TODO: Récupérer l'utilisateur ou société depuis req.user
    // Pour l'instant, on suppose que req.user contient {id, type}
    const user = req.user || { id: 1, type: 'User' }; // Mock

    const post = await this.postPolymorphicService['postRepository'].findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Déterminer si c'est un User ou Societe
    const liker =
      user.type === 'User'
        ? await this.likePolymorphicService['userRepository'].findOne({
            where: { id: user.id },
          })
        : await this.likePolymorphicService['societeRepository'].findOne({
            where: { id: user.id },
          });

    const like = await this.likePolymorphicService.createLike(post, liker!);

    return {
      message: 'Post liké avec succès',
      like: {
        id: like.id,
        post_id: like.post_id,
        created_at: like.created_at,
      },
    };
  }

  /**
   * Unlike un post
   * DELETE /likes/post/:postId
   */
  @Delete('post/:postId')
  @HttpCode(HttpStatus.OK)
  async unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req: any,
  ) {
    const user = req.user || { id: 1, type: 'User' }; // Mock

    const post = await this.postPolymorphicService['postRepository'].findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const liker =
      user.type === 'User'
        ? await this.likePolymorphicService['userRepository'].findOne({
            where: { id: user.id },
          })
        : await this.likePolymorphicService['societeRepository'].findOne({
            where: { id: user.id },
          });

    const removed = await this.likePolymorphicService.removeLike(post, liker!);

    return {
      message: removed ? 'Like supprimé avec succès' : 'Like non trouvé',
      success: removed,
    };
  }

  /**
   * Vérifier si l'utilisateur a liké un post
   * GET /likes/post/:postId/check
   */
  @Get('post/:postId/check')
  async checkLike(
    @Param('postId', ParseIntPipe) postId: number,
    @Request() req: any,
  ) {
    const user = req.user || { id: 1, type: 'User' }; // Mock

    const post = await this.postPolymorphicService['postRepository'].findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const liker =
      user.type === 'User'
        ? await this.likePolymorphicService['userRepository'].findOne({
            where: { id: user.id },
          })
        : await this.likePolymorphicService['societeRepository'].findOne({
            where: { id: user.id },
          });

    const hasLiked = await this.likePolymorphicService.hasLiked(post, liker!);

    return {
      hasLiked,
      post_id: postId,
    };
  }

  /**
   * Récupérer tous les likes d'un post avec leurs auteurs
   * GET /likes/post/:postId
   */
  @Get('post/:postId')
  async getPostLikes(@Param('postId', ParseIntPipe) postId: number) {
    const likesWithAuthors =
      await this.likePolymorphicService.getLikesWithAuthors(postId);

    return {
      total: likesWithAuthors.length,
      likes: likesWithAuthors.map((item) => ({
        id: item.like.id,
        created_at: item.like.created_at,
        author: {
          id: item.author.id,
          type: item.like.likeable_type,
          name:
            item.like.likeable_type === 'User'
              ? `${(item.author as any).prenom} ${(item.author as any).nom}`
              : (item.author as any).nom_societe,
        },
      })),
    };
  }

  /**
   * Récupérer les posts likés par l'utilisateur connecté
   * GET /likes/my-liked-posts
   */
  @Get('my-liked-posts')
  async getMyLikedPosts(@Request() req: any) {
    const user = req.user || { id: 1, type: 'User' }; // Mock

    const posts =
      user.type === 'User'
        ? await this.likePolymorphicService.getLikedPostsByUser(user.id)
        : await this.likePolymorphicService.getLikedPostsBySociete(user.id);

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
