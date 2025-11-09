// modules/societes/entities/societe-user.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Societe } from './societe.entity';
import { User } from '../../users/entities/user.entity';

@Entity('societe_user')
export class SocieteUser {
  @PrimaryColumn()
  societe_id: number;

  @PrimaryColumn()
  user_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'membre',
  })
  role: string; // 'membre', 'admin'

  @Column({
    type: 'varchar',
    length: 50,
    default: 'active',
  })
  status: string; // 'active', 'inactive'

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Societe)
  @JoinColumn({ name: 'societe_id' })
  societe: Societe;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
