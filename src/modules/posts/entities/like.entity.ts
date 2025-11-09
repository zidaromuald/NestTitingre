// modules/posts/entities/like.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('likes')
@Index(['post_id', 'likeable_id', 'likeable_type'], { unique: true })
@Index(['likeable_id', 'likeable_type'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  post_id: number;

  // Relations polymorphiques (User ou Societe)
  @Column({ type: 'int' })
  likeable_id: number;

  @Column({ type: 'varchar', length: 100 })
  likeable_type: string; // 'User' ou 'Societe'

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Post, (post) => post.likes)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  // Méthodes helper
  isLikeByUser(): boolean {
    return this.likeable_type === 'User';
  }

  isLikeBySociete(): boolean {
    return this.likeable_type === 'Societe';
  }
}
