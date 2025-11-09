// modules/posts/entities/post.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Groupe } from '../../groupes/entities/groupe.entity';
import { Societe } from '../../societes/entities/societe.entity';
import { Like } from './like.entity';
import { Commentaire } from './commentaire.entity';

export enum PostVisibility {
  PUBLIC = 'public',
  MEMBRES_ONLY = 'membres_only',
  ADMINS_ONLY = 'admins_only',
}

@Entity('posts')
@Index(['groupe_id'])
@Index(['societe_id'])
@Index(['posted_by_id', 'posted_by_type'])
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  groupe_id: number;

  @Column({ type: 'int', nullable: true })
  societe_id: number;

  // Auteur du post (relation polymorphique: User ou Societe)
  // L'auteur peut poster:
  // 1. Sur son propre profil (groupe_id = null, societe_id = null)
  // 2. Dans un Groupe dont il est membre (groupe_id renseigné)
  // 3. Dans une Société dont il est employé (societe_id renseigné)
  @Column({ type: 'int' })
  posted_by_id: number;

  @Column({ type: 'varchar', length: 100 })
  posted_by_type: string; // 'User' ou 'Societe'

  @Column({ type: 'text' })
  contenu: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'json', nullable: true })
  videos: string[];

  @Column({ type: 'json', nullable: true })
  audios: string[]; 
  
  @Column({ type: 'json', nullable: true })
  documents: string[];

  @Column({
    type: 'enum',
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  visibility: PostVisibility;

  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'int', default: 0 })
  comments_count: number;

  @Column({ type: 'int', default: 0 })
  shares_count: number;

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  @Column({ type: 'boolean', default: false })
  is_edited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  edited_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Groupe, (groupe) => groupe.posts, { nullable: true })
  @JoinColumn({ name: 'groupe_id' })
  groupe: Groupe;

  @ManyToOne(() => Societe, { nullable: true })
  @JoinColumn({ name: 'societe_id' })
  societe: Societe;

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @OneToMany(() => Commentaire, (commentaire) => commentaire.post)
  commentaires: Commentaire[];

  // Méthodes helper - Auteur
  isPostedByUser(): boolean {
    return this.posted_by_type === 'User';
  }

  isPostedBySociete(): boolean {
    return this.posted_by_type === 'Societe';
  }

  // Méthodes helper - Canal de publication
  isPersonalPost(): boolean {
    return this.groupe_id === null;
  }

  isGroupPost(): boolean {
    return this.groupe_id !== null;
  }

  // Méthodes helper - Médias
  hasMedia(): boolean {
    return (
      (this.images && this.images.length > 0) ||
      (this.videos && this.videos.length > 0) ||
      (this.audios && this.audios.length > 0) ||
      (this.documents && this.documents.length > 0)
    );
  }

  hasAudio(): boolean {
    return this.audios && this.audios.length > 0;
  }

  hasImages(): boolean {
    return this.images && this.images.length > 0;
  }

  hasVideos(): boolean {
    return this.videos && this.videos.length > 0;
  }

  hasDocuments(): boolean {
    return this.documents && this.documents.length > 0;
  }
}
