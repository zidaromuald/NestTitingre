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
  UseGuards,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { PostMapper } from '../mappers/post.mapper';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { SearchPostDto } from '../dto/search-post.dto';
import { PostVisibility } from '../entities/post.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';
import { Societe } from '../../societes/entities/societe.entity';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postMapper: PostMapper,
  ) {}

  /**
   * Créer un nouveau post
   * POST /posts
   * Nécessite authentification
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const post = await this.postService.create(createPostDto, currentUser);
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
   * Nécessite authentification
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const post = await this.postService.update(id, updatePostDto, currentUser);
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
   * Nécessite authentification
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User | Societe,
  ) {
    await this.postService.remove(id, currentUser);

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
  @UseGuards(JwtAuthGuard)
  async getMyFeed(
    @CurrentUser() currentUser: User | Societe,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('onlyWithMedia') onlyWithMedia?: boolean,
  ) {
    const posts = await this.postService.getPersonalizedFeed(currentUser, {
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
   *
   * IMPORTANT: Au moins un paramètre de recherche est requis
   *
   * @example
   * GET /posts/search/query?q=javascript&visibility=public
   * GET /posts/search/query?authorId=5&authorType=User&hasMedia=true
   * GET /posts/search/query?groupeId=10&isPinned=true
   * GET /posts/search/query?startDate=2025-01-01&endDate=2025-01-31
   */
  @Get('search/query')
  async search(@Query() searchDto: SearchPostDto) {
    // Vérifier que authorId et authorType sont fournis ensemble
    if (searchDto.authorId && !searchDto.authorType) {
      return {
        success: false,
        message: 'authorType est requis quand authorId est fourni',
        data: [],
        meta: {
          hint: 'Utilisez authorId ET authorType ensemble (ex: authorId=3&authorType=User)',
        },
      };
    }

    if (searchDto.authorType && !searchDto.authorId) {
      return {
        success: false,
        message: 'authorId est requis quand authorType est fourni',
        data: [],
        meta: {
          hint: 'Utilisez authorId ET authorType ensemble (ex: authorId=3&authorType=User)',
        },
      };
    }

    // Vérifier qu'au moins un paramètre de recherche est fourni
    const hasSearchCriteria =
      searchDto.q ||
      (searchDto.authorId && searchDto.authorType) ||
      searchDto.groupeId ||
      searchDto.societeId ||
      searchDto.visibility ||
      searchDto.hasMedia !== undefined ||
      searchDto.isPinned !== undefined ||
      searchDto.startDate ||
      searchDto.endDate;

    if (!hasSearchCriteria) {
      return {
        success: false,
        message: 'Au moins un critère de recherche est requis',
        data: [],
        meta: {
          count: 0,
          availableFilters: [
            'q (recherche texte)',
            'authorId + authorType (les deux requis)',
            'groupeId',
            'societeId',
            'visibility',
            'hasMedia',
            'isPinned',
            'startDate',
            'endDate',
          ],
        },
      };
    }

    const posts = await this.postService.search({
      searchQuery: searchDto.q,
      authorId: searchDto.authorId,
      authorType: searchDto.authorType,
      groupeId: searchDto.groupeId,
      visibility: searchDto.visibility,
      hasMedia: searchDto.hasMedia,
      isPinned: searchDto.isPinned,
      startDate: searchDto.startDate ? new Date(searchDto.startDate) : undefined,
      endDate: searchDto.endDate ? new Date(searchDto.endDate) : undefined,
    });

    return {
      success: true,
      data: posts.map((post) => this.postMapper.toSimpleData(post)),
      meta: {
        count: posts.length,
        filters: {
          query: searchDto.q,
          authorId: searchDto.authorId,
          authorType: searchDto.authorType,
          groupeId: searchDto.groupeId,
          societeId: searchDto.societeId,
          visibility: searchDto.visibility,
          hasMedia: searchDto.hasMedia,
          isPinned: searchDto.isPinned,
          startDate: searchDto.startDate,
          endDate: searchDto.endDate,
        },
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
   * Nécessite authentification (et d'être admin du groupe/société)
   */
  @Put(':id/pin')
  @UseGuards(JwtAuthGuard)
  async togglePin(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User | Societe,
  ) {
    const post = await this.postService.togglePin(id, currentUser);

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
