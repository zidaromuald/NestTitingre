import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from '../services/post.service';
import { PostMapper } from '../mappers/post.mapper';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostVisibility } from '../entities/post.entity';
import { NotFoundException } from '@nestjs/common';

describe('PostController', () => {
  let controller: PostController;

  const mockUser = { id: 1, type: 'User' };

  const mockPost = {
    id: 1,
    groupe_id: null,
    societe_id: null,
    posted_by_id: 1,
    posted_by_type: 'User',
    contenu: 'Test post',
    images: [],
    videos: [],
    audios: [],
    documents: [],
    visibility: PostVisibility.PUBLIC,
    likes_count: 0,
    comments_count: 0,
    shares_count: 0,
    is_pinned: false,
    is_edited: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPostService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getFeed: jest.fn(),
    getPersonalizedFeed: jest.fn(),
    getTrendingPosts: jest.fn(),
    search: jest.fn(),
    getPostsByAuthor: jest.fn(),
    getPostsByGroupe: jest.fn(),
    togglePin: jest.fn(),
    incrementSharesCount: jest.fn(),
  };

  const mockPostMapper = {
    toPublicData: jest.fn(),
    toDetailedData: jest.fn(),
    toSimpleData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: mockPostService,
        },
        {
          provide: PostMapper,
          useValue: mockPostMapper,
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create - Créer un post', () => {
    it('devrait créer un post avec uniquement du texte', async () => {
      const createPostDto: CreatePostDto = {
        contenu: 'Ceci est un post texte simple',
      };

      const expectedPost = { ...mockPost, contenu: createPostDto.contenu };

      mockPostService.create.mockResolvedValue(expectedPost);
      mockPostService.findOne.mockResolvedValue({
        post: expectedPost,
        author: mockUser,
        groupe: null,
      });
      mockPostMapper.toPublicData.mockReturnValue({
        id: expectedPost.id,
        contenu: expectedPost.contenu,
      });

      const result = await controller.create(createPostDto, mockUser as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Post créé avec succès');
      expect(mockPostService.create).toHaveBeenCalledWith(
        createPostDto,
        mockUser,
      );
    });

    it('devrait créer un post avec une image', async () => {
      const createPostDto: CreatePostDto = {
        contenu: 'Post avec image',
        images: ['uploads/images/photo-1234.jpg'],
      };

      const expectedPost = {
        ...mockPost,
        contenu: createPostDto.contenu,
        images: createPostDto.images,
      };

      mockPostService.create.mockResolvedValue(expectedPost);
      mockPostService.findOne.mockResolvedValue({
        post: expectedPost,
        author: mockUser,
        groupe: null,
      });
      mockPostMapper.toPublicData.mockReturnValue({
        id: expectedPost.id,
        contenu: expectedPost.contenu,
        images: expectedPost.images,
      });

      const result = await controller.create(createPostDto, mockUser as any);

      expect(result.success).toBe(true);
      expect(mockPostService.create).toHaveBeenCalledWith(
        createPostDto,
        mockUser,
      );
    });

    it('devrait créer un post avec plusieurs images', async () => {
      const createPostDto: CreatePostDto = {
        contenu: 'Post avec plusieurs images',
        images: [
          'uploads/images/photo-1.jpg',
          'uploads/images/photo-2.jpg',
          'uploads/images/photo-3.jpg',
        ],
      };

      const expectedPost = {
        ...mockPost,
        contenu: createPostDto.contenu,
        images: createPostDto.images,
      };

      mockPostService.create.mockResolvedValue(expectedPost);
      mockPostService.findOne.mockResolvedValue({
        post: expectedPost,
        author: mockUser,
        groupe: null,
      });

      const result = await controller.create(createPostDto, mockUser as any);

      expect(result.success).toBe(true);
      expect(mockPostService.create).toHaveBeenCalledWith(
        createPostDto,
        mockUser,
      );
    });

    it('devrait créer un post avec une vidéo', async () => {
      const createPostDto: CreatePostDto = {
        contenu: 'Post avec vidéo',
        videos: ['uploads/videos/video-1234.mp4'],
      };

      const expectedPost = {
        ...mockPost,
        contenu: createPostDto.contenu,
        videos: createPostDto.videos,
      };

      mockPostService.create.mockResolvedValue(expectedPost);
      mockPostService.findOne.mockResolvedValue({
        post: expectedPost,
        author: mockUser,
        groupe: null,
      });

      const result = await controller.create(createPostDto, mockUser as any);

      expect(result.success).toBe(true);
      expect(mockPostService.create).toHaveBeenCalledWith(
        createPostDto,
        mockUser,
      );
    });

    it('devrait créer un post avec un fichier audio (message vocal)', async () => {
      const createPostDto: CreatePostDto = {
        contenu: 'Post avec message vocal',
        audios: ['uploads/audios/voice-message-1234.mp3'],
      };

      const expectedPost = {
        ...mockPost,
        contenu: createPostDto.contenu,
        audios: createPostDto.audios,
      };

      mockPostService.create.mockResolvedValue(expectedPost);
      mockPostService.findOne.mockResolvedValue({
        post: expectedPost,
        author: mockUser,
        groupe: null,
      });

      const result = await controller.create(createPostDto, mockUser as any);

      expect(result.success).toBe(true);
      expect(mockPostService.create).toHaveBeenCalledWith(
        createPostDto,
        mockUser,
      );
    });

    it('devrait créer un post avec image, vidéo et audio', async () => {
      const createPostDto: CreatePostDto = {
        contenu: 'Post multimédia complet',
        images: ['uploads/images/photo.jpg', 'uploads/images/photo2.jpg'],
        videos: ['uploads/videos/video.mp4'],
        audios: ['uploads/audios/audio.mp3'],
      };

      const expectedPost = {
        ...mockPost,
        contenu: createPostDto.contenu,
        images: createPostDto.images,
        videos: createPostDto.videos,
        audios: createPostDto.audios,
      };

      mockPostService.create.mockResolvedValue(expectedPost);
      mockPostService.findOne.mockResolvedValue({
        post: expectedPost,
        author: mockUser,
        groupe: null,
      });

      const result = await controller.create(createPostDto, mockUser as any);

      expect(result.success).toBe(true);
      expect(mockPostService.create).toHaveBeenCalledWith(
        createPostDto,
        mockUser,
      );
    });

    it('devrait créer un post dans un groupe', async () => {
      const createPostDto: CreatePostDto = {
        groupe_id: 5,
        contenu: 'Post dans un groupe',
        images: ['uploads/images/group-photo.jpg'],
      };

      const expectedPost = {
        ...mockPost,
        groupe_id: 5,
        contenu: createPostDto.contenu,
        images: createPostDto.images,
      };

      mockPostService.create.mockResolvedValue(expectedPost);
      mockPostService.findOne.mockResolvedValue({
        post: expectedPost,
        author: mockUser,
        groupe: { id: 5, nom: 'Mon Groupe' },
      });

      const result = await controller.create(createPostDto, mockUser as any);

      expect(result.success).toBe(true);
      expect(mockPostService.create).toHaveBeenCalledWith(
        createPostDto,
        mockUser,
      );
    });

    it('devrait créer un post avec visibilité MEMBRES_ONLY', async () => {
      const createPostDto: CreatePostDto = {
        groupe_id: 5,
        contenu: 'Post privé pour les membres',
        visibility: PostVisibility.MEMBRES_ONLY,
        images: ['uploads/images/private-photo.jpg'],
      };

      const expectedPost = {
        ...mockPost,
        groupe_id: 5,
        contenu: createPostDto.contenu,
        visibility: PostVisibility.MEMBRES_ONLY,
        images: createPostDto.images,
      };

      mockPostService.create.mockResolvedValue(expectedPost);
      mockPostService.findOne.mockResolvedValue({
        post: expectedPost,
        author: mockUser,
        groupe: { id: 5, nom: 'Mon Groupe' },
      });

      const result = await controller.create(createPostDto, mockUser as any);

      expect(result.success).toBe(true);
    });
  });

  describe('findOne - Récupérer un post', () => {
    it('devrait récupérer un post par ID', async () => {
      mockPostService.findOne.mockResolvedValue({
        post: mockPost,
        author: mockUser,
        groupe: null,
      });
      mockPostMapper.toDetailedData.mockReturnValue({
        id: mockPost.id,
        contenu: mockPost.contenu,
      });

      const result = await controller.findOne(1);

      expect(result.success).toBe(true);
      expect(mockPostService.findOne).toHaveBeenCalledWith(1);
    });

    it('devrait lancer une exception si le post n\'existe pas', async () => {
      mockPostService.findOne.mockRejectedValue(
        new NotFoundException('Post non trouvé'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update - Mettre à jour un post', () => {
    it('devrait mettre à jour le contenu d\'un post', async () => {
      const updatePostDto: UpdatePostDto = {
        contenu: 'Contenu mis à jour',
      };

      const updatedPost = {
        ...mockPost,
        contenu: updatePostDto.contenu,
        is_edited: true,
        edited_at: new Date(),
      };

      mockPostService.update.mockResolvedValue(updatedPost);
      mockPostService.findOne.mockResolvedValue({
        post: updatedPost,
        author: mockUser,
        groupe: null,
      });

      const result = await controller.update(1, updatePostDto, mockUser as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Post mis à jour avec succès');
    });

    it('devrait ajouter une image à un post existant', async () => {
      const updatePostDto: UpdatePostDto = {
        images: ['uploads/images/new-photo.jpg'],
      };

      const updatedPost = {
        ...mockPost,
        images: updatePostDto.images,
        is_edited: true,
      };

      mockPostService.update.mockResolvedValue(updatedPost);
      mockPostService.findOne.mockResolvedValue({
        post: updatedPost,
        author: mockUser,
        groupe: null,
      });

      const result = await controller.update(1, updatePostDto, mockUser as any);

      expect(result.success).toBe(true);
    });
  });

  describe('remove - Supprimer un post', () => {
    it('devrait supprimer un post', async () => {
      mockPostService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1, mockUser as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Post supprimé avec succès');
      expect(mockPostService.remove).toHaveBeenCalledWith(1, mockUser);
    });
  });

  describe('share - Partager un post', () => {
    it('devrait incrémenter le compteur de partages', async () => {
      const sharedPost = {
        ...mockPost,
        shares_count: 1,
      };

      mockPostService.incrementSharesCount.mockResolvedValue(undefined);
      mockPostService.findOne.mockResolvedValue({
        post: sharedPost,
        author: mockUser,
        groupe: null,
      });

      const result = await controller.share(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Post partagé');
      expect(result.data.shares_count).toBe(1);
    });
  });

  describe('togglePin - Épingler/Désépingler un post', () => {
    it('devrait épingler un post', async () => {
      const pinnedPost = {
        ...mockPost,
        is_pinned: true,
      };

      mockPostService.togglePin.mockResolvedValue(pinnedPost);

      const result = await controller.togglePin(1, mockUser as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Post épinglé avec succès');
      expect(result.data.is_pinned).toBe(true);
    });

    it('devrait désépingler un post', async () => {
      const unpinnedPost = {
        ...mockPost,
        is_pinned: false,
      };

      mockPostService.togglePin.mockResolvedValue(unpinnedPost);

      const result = await controller.togglePin(1, mockUser as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Post désépinglé avec succès');
      expect(result.data.is_pinned).toBe(false);
    });
  });

  describe('getFeed - Récupérer le feed public', () => {
    it('devrait récupérer le feed public', async () => {
      const posts = [mockPost];
      mockPostService.getFeed.mockResolvedValue(posts);
      mockPostMapper.toSimpleData.mockReturnValue({
        id: mockPost.id,
        contenu: mockPost.contenu,
      });

      const result = await controller.getFeed(20, 0, false);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.count).toBe(1);
    });

    it('devrait récupérer uniquement les posts avec média', async () => {
      const postWithMedia = {
        ...mockPost,
        images: ['uploads/images/photo.jpg'],
      };
      mockPostService.getFeed.mockResolvedValue([postWithMedia]);

      const result = await controller.getFeed(20, 0, true);

      expect(result.success).toBe(true);
      expect(mockPostService.getFeed).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        onlyWithMedia: true,
      });
    });
  });

  describe('search - Rechercher des posts', () => {
    it('devrait rechercher des posts par contenu', async () => {
      const posts = [mockPost];
      mockPostService.search.mockResolvedValue(posts);

      const result = await controller.search('test');

      expect(result.success).toBe(true);
      expect(mockPostService.search).toHaveBeenCalledWith({
        searchQuery: 'test',
        authorId: undefined,
        authorType: undefined,
        groupeId: undefined,
        visibility: undefined,
        hasMedia: false,
      });
    });

    it('devrait rechercher des posts avec média uniquement', async () => {
      const postWithMedia = {
        ...mockPost,
        videos: ['uploads/videos/video.mp4'],
      };
      mockPostService.search.mockResolvedValue([postWithMedia]);

      const result = await controller.search(
        'vidéo',
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      );

      expect(result.success).toBe(true);
      expect(mockPostService.search).toHaveBeenCalledWith(
        expect.objectContaining({
          hasMedia: true,
        }),
      );
    });
  });
});
