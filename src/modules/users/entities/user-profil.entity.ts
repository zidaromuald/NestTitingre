// modules/users/entities/user-profil.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profils')
export class UserProfil {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  experience: string;

  @Column({ type: 'text', nullable: true })
  formation: string;

  // Colonnes pour les notifications
  @Column({ type: 'boolean', default: true })
  notifications_posts: boolean;

  @Column({ type: 'boolean', default: false })
  notifications_email: boolean;

  // Colonnes pour les statistiques
  @Column({ type: 'timestamp', nullable: true })
  derniere_visite: Date;

  @Column({ type: 'timestamp', nullable: true })
  derniere_interaction: Date;

  @Column({ type: 'int', default: 0 })
  total_likes: number;

  @Column({ type: 'int', default: 0 })
  total_commentaires: number;

  @Column({ type: 'int', default: 0 })
  total_partages: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Méthodes helper
  getPhotoUrl(): string | null {
    return this.photo ? `/storage/${this.photo}` : null;
  }

  getCompletudeScore(): number {
    const fields = [
      this.photo,
      this.bio,
      this.experience,
      this.formation,
    ];

    const completed = fields.filter((field) => !!field).length;
    return Math.round((completed / fields.length) * 100);
  }
}
