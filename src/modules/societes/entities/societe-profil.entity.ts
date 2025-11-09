// modules/societes/entities/societe-profil.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Societe } from './societe.entity';

@Entity('societe_profils')
export class SocieteProfil {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  societe_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secteur_activite: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taille_entreprise: string;

  @Column({ type: 'int', nullable: true })
  nombre_employes: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  chiffre_affaires: number;

  @Column({ type: 'int', nullable: true })
  annee_creation: number;

  @Column({ type: 'json', nullable: true })
  certifications: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  adresse_complete: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ville: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pays: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  code_postal: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telephone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email_contact: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => Societe, (societe) => societe.profile)
  @JoinColumn({ name: 'societe_id' })
  societe: Societe;

  // Méthodes helper
  getLogoUrl(): string | null {
    return this.logo ? `/storage/${this.logo}` : null;
  }

  getCompletudeScore(): number {
    const fields = [
      this.logo,
      this.secteur_activite,
      this.description,
      this.taille_entreprise,
      this.annee_creation,
    ];

    const completed = fields.filter((field) => !!field).length;
    return Math.round((completed / fields.length) * 100);
  }
}
