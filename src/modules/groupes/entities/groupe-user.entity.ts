// modules/groupes/entities/groupe-user.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Groupe } from './groupe.entity';
import { User } from '../../users/entities/user.entity';

@Entity('groupe_users')
export class GroupeUser {
  @PrimaryColumn()
  id: number;

  @Column()
  groupe_id: number;

  @Column()
  member_id: number;

  @Column({ type: 'varchar', length: 100 })
  member_type: string; // 'User' ou 'Societe'

  @Column({
    type: 'varchar',
    length: 100,
    default: 'member',
  })
  role: string; // 'member', 'moderator', 'admin'

  @CreateDateColumn()
  joined_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Groupe)
  @JoinColumn({ name: 'groupe_id' })
  groupe: Groupe;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'member_id' })
  user: User;
}
