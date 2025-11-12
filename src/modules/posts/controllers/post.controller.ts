// modules/posts/controllers/post.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { PostMapper } from '../mappers/post.mapper';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostVisibility } from '../entities/post.entity';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postMapper: PostMapper,
  ) {}

  /**
   * Créer un nouveau post
   * POST /posts
   */
  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    // TODO: Récupérer l'utilisateur authentifié depuis le contexte (JWT)
    // const currentUser = req.user;
    const mockUser = { id: 1, type: 'User' } as any;

    const post = await this.postService.create(createPostDto, mockUser);
    const { author, groupe } = await this.postService.findOne(post.id);

    return {
      success: true,
      message: 'Post créé avec succès',
      data: this.postMapper.toPublicData(post, author, groupe),
    };
  }

  /**
   * Récupérer un post par ID
   * GET /posts/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const { post, author, groupe } = await this.postService.findOne(id);

    return {
      success: true,
      data: this.postMapper.toDetailedData(post, author, groupe),
    };
  }

  /**
   * Mettre à jour un post
   * PUT /posts/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const mockUser = { id: 1, type: 'User' } as any;

    const post = await this.postService.update(id, updatePostDto, mockUser);
    const { author, groupe } = await this.postService.findOne(post.id);

    return {
      success: true,
      message: 'Post mis à jour avec succès',
      data: this.postMapper.toPublicData(post, author, groupe),
    };
  }

  /**
   * Supprimer un post
   * DELETE /posts/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const mockUser = { id: 1, type: 'User' } as any;

    await this.postService.remove(id, mockUser);

    return {
      success: true,
      message: 'Post supprimé avec succès',
    };
  }

  /**
   * Récupérer le feed personnalisé
   * GET /posts/feed/my-feed
   * Nécessite authentification
   */
  @Get('feed/my-feed')
  async getMyFeed(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('onlyWithMedia') onlyWithMedia?: boolean,
  ) {
    // TODO: Récupérer l'utilisateur authentifié depuis le contexte (JWT)
    // const currentUser = req.user;
    const mockUser = { id: 1, type: 'User' } as any;

    const posts = await this.postService.getPersonalizedFeed(mockUser, {
      limit: limit || 20,
      offset: offset || 0,
      onlyWithMedia: onlyWithMedia === true,
    });

    return {
      success: true,
      data: posts.map((post) => this.postMapper.toSimpleData(post)),
      meta: {
        count: posts.length,
        limit: limit || 20,
        offset: offset || 0,
      },
    };
  }

  /**
   * Récupérer le feed public
   * GET /posts/feed/public
   */
  @Get('feed/public')
  async getFeed(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('onlyWithMedia') onlyWithMedia?: boolean,
  ) {
    const posts = await this.postService.getFeed({
      limit: limit || 20,
      offset: offset || 0,
      onlyWithMedia: onlyWithMedia === true,
    });

    return {
      success: true,
      data: posts.map((post) => this.postMapper.toSimpleData(post)),
      meta: {
        count: posts.length,
        limit: limit || 20,
        offset: offset || 0,
      },
    };
  }

  /**
   * Récupérer les posts tendances
   * GET /posts/trending/top
   */
  @Get('trending/top')
  async getTrending(@Query('limit') limit?: number) {
    const posts = await this.postService.getTrendingPosts(limit || 10);

    return {
      success: true,
      data: posts.map((post) => this.postMapper.toSimpleData(post)),
    };
  }

  /**
   * Rechercher des posts
   * GET /posts/search/query
   */
  @Get('search/query')
  async search(
    @Query('q') query?: string,
    @Query('authorId') authorId?: number,
    @Query('authorType') authorType?: string,
    @Query('groupeId') groupeId?: number,
    @Query('visibility') visibility?: PostVisibility,
    @Query('hasMedia') hasMedia?: boolean,
  ) {
    const posts = await this.postService.search({
      searchQuery: query,
      authorId,
      authorType,
      groupeId,
      visibility,
      hasMedia: hasMedia === true,
    });

    return {
      success: true,
      data: posts.map((post) => this.postMapper.toSimpleData(post)),
      meta: {
        count: posts.length,
      },
    };
  }

  /**
   * Récupérer les posts d'un auteur
   * GET /posts/author/:type/:id
   */
  @Get('author/:type/:id')
  async getByAuthor(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
    @Query('includeGroupPosts') includeGroupPosts?: boolean,
  ) {
    const posts = await this.postService.getPostsByAuthor(
      id,
      type,
      includeGroupPosts === true,
    );

    return {
      success: true,
      data: posts.map((post) => this.postMapper.toSimpleData(post)),
      meta: {
        count: posts.length,
        authorId: id,
        authorType: type,
      },
    };
  }

  /**
   * Récupérer les posts d'un groupe
   * GET /posts/groupe/:id
   */
  @Get('groupe/:id')
  async getByGroupe(
    @Param('id', ParseIntPipe) id: number,
    @Query('visibility') visibility?: PostVisibility,
  ) {
    const posts = await this.postService.getPostsByGroupe(id, visibility);

    return {
      success: true,
      data: posts.map((post) => this.postMapper.toSimpleData(post)),
      meta: {
        count: posts.length,
        groupeId: id,
      },
    };
  }

  /**
   * Épingler/désépingler un post
   * PUT /posts/:id/pin
   */
  @Put(':id/pin')
  async togglePin(@Param('id', ParseIntPipe) id: number) {
    const mockUser = { id: 1, type: 'User' } as any;

    const post = await this.postService.togglePin(id, mockUser);

    return {
      success: true,
      message: post.is_pinned
        ? 'Post épinglé avec succès'
        : 'Post désépinglé avec succès',
      data: {
        id: post.id,
        is_pinned: post.is_pinned,
      },
    };
  }

  /**
   * Partager un post (incrémenter le compteur)
   * POST /posts/:id/share
   */
  @Post(':id/share')
  @HttpCode(HttpStatus.OK)
  async share(@Param('id', ParseIntPipe) id: number) {
    await this.postService.incrementSharesCount(id);
    const { post } = await this.postService.findOne(id);

    return {
      success: true,
      message: 'Post partagé',
      data: {
        id: post.id,
        shares_count: post.shares_count,
      },
    };
  }
}
