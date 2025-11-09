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

  @Column({ type: 'json', nullable: true })
  competences: string[];

  @Column({ type: 'text', nullable: true })
  experience: string;

  @Column({ type: 'text', nullable: true })
  formation: string;

  // Champs optionnels pour extensions futures
  @Column({ type: 'varchar', length: 255, nullable: true })
  linkedin: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  github: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  portfolio: string;

  @Column({ type: 'json', nullable: true })
  langues: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  disponibilite: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaire_souhaite: number;

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

  getCompetencesString(): string {
    return Array.isArray(this.competences) ? this.competences.join(', ') : '';
  }

  getCompletudeScore(): number {
    const fields = [
      this.photo,
      this.bio,
      this.competences && this.competences.length > 0,
      this.experience,
      this.formation,
    ];

    const completed = fields.filter((field) => !!field).length;
    return Math.round((completed / fields.length) * 100);
  }
}
