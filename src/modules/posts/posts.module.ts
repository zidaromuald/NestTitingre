import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './services/post.service';
import { PostPolymorphicService } from './services/post-polymorphic.service';
import { PostPermissionService } from './services/post-permission.service';
import { LikePolymorphicService } from './services/like-polymorphic.service';
import { CommentairePolymorphicService } from './services/commentaire-polymorphic.service';
import { PostController } from './controllers/post.controller';
import { LikeController } from './controllers/like.controller';
import { CommentaireController } from './controllers/commentaire.controller';
import { Post } from './entities/post.entity';
import { Like } from './entities/like.entity';
import { Commentaire } from './entities/commentaire.entity';
import { User } from '../users/entities/user.entity';
import { Societe } from '../societes/entities/societe.entity';
import { Groupe } from '../groupes/entities/groupe.entity';
import { GroupeUser } from '../groupes/entities/groupe-user.entity';
import { SocieteUser } from '../societes/entities/societe-user.entity';
import { InvitationSuivi } from '../suivis/entities/invitation-suivi.entity';
import { PostRepository } from './repositories/post.repository';
import { PostMapper } from './mappers/post.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      Like,
      Commentaire,
      User,
      Societe,
      Groupe,
      GroupeUser,
      SocieteUser,
      InvitationSuivi,
      PostRepository,
    ]),
  ],
  providers: [
    PostService,
    PostPolymorphicService,
    PostPermissionService,
    LikePolymorphicService,
    CommentairePolymorphicService,
    PostRepository,
    PostMapper,
  ],
  controllers: [PostController, LikeController, CommentaireController],
  exports: [
    PostService,
    PostPolymorphicService,
    PostPermissionService,
    LikePolymorphicService,
    CommentairePolymorphicService,
    PostRepository,
    PostMapper,
  ],
})
export class PostsModule {}
