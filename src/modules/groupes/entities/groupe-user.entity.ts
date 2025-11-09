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

@Entity('groupe_user')
export class GroupeUser {
  @PrimaryColumn()
  groupe_id: number;

  @PrimaryColumn()
  user_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'membre',
  })
  role: string; // 'membre', 'moderateur', 'admin'

  @Column({
    type: 'varchar',
    length: 50,
    default: 'active',
  })
  status: string; // 'active', 'suspended', 'banned'

  @CreateDateColumn()
  joined_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Groupe)
  @JoinColumn({ name: 'groupe_id' })
  groupe: Groupe;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
