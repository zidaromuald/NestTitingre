// modules/groupes/entities/groupe-profil.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Groupe } from './groupe.entity';

@Entity('groupe_profils')
export class GroupeProfil {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  groupe_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo_couverture: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  regles: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  localisation: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  langue_principale: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secteur_activite: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => Groupe, (groupe) => groupe.profil)
  @JoinColumn({ name: 'groupe_id' })
  groupe: Groupe;

  // Méthodes helper
  getPhotoCouvertureUrl(): string | null {
    return this.photo_couverture ? `/storage/${this.photo_couverture}` : null;
  }

  getLogoUrl(): string | null {
    return this.logo ? `/storage/${this.logo}` : null;
  }

  hasPhotoCouverture(): boolean {
    return !!this.photo_couverture;
  }

  hasLogo(): boolean {
    return !!this.logo;
  }
}
