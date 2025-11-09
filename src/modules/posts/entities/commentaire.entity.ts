// modules/posts/entities/commentaire.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('commentaires')
@Index(['post_id'])
@Index(['commentable_id', 'commentable_type'])
export class Commentaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  post_id: number;

  // Relations polymorphiques (User ou Societe)
  @Column({ type: 'int' })
  commentable_id: number;

  @Column({ type: 'varchar', length: 100 })
  commentable_type: string; // 'User' ou 'Societe'

  @Column({ type: 'text' })
  contenu: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Post, (post) => post.commentaires)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  // Méthodes helper
  isCommentByUser(): boolean {
    return this.commentable_type === 'User';
  }

  isCommentBySociete(): boolean {
    return this.commentable_type === 'Societe';
  }
}
