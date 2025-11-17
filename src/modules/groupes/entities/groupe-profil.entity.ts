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

  @Column({ type: 'text', nullable: true })
  regles: string;

  @Column({ type: 'json', nullable: true })
  categories: any;

  @Column({ type: 'json', nullable: true })
  tags: any;

  @Column({ type: 'varchar', nullable: true })
  contact_email: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => Groupe, (groupe) => groupe.profil)
  @JoinColumn({ name: 'groupe_id' })
  groupe: Groupe;

}
