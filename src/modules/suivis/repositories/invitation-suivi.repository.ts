// modules/suivis/repositories/invitation-suivi.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InvitationSuivi, InvitationSuiviStatus } from '../entities/invitation-suivi.entity';

@Injectable()
export class InvitationSuiviRepository extends Repository<InvitationSuivi> {
  constructor(private dataSource: DataSource) {
    super(InvitationSuivi, dataSource.createEntityManager());
  }

  async findInvitation(senderId: number, senderType: string, targetId: number, targetType: string): Promise<InvitationSuivi | null> {
    return this.findOne({
      where: {
        sender_id: senderId,
        sender_type: senderType,
        target_id: targetId,
        target_type: targetType
      }
    });
  }

  async findInvitationsEnvoyees(senderId: number, senderType: string, status?: InvitationSuiviStatus): Promise<InvitationSuivi[]> {
    const where: any = { sender_id: senderId, sender_type: senderType };
    if (status) where.status = status;
    return this.find({ where, order: { created_at: 'DESC' } });
  }

  async findInvitationsRecues(targetId: number, targetType: string, status?: InvitationSuiviStatus): Promise<InvitationSuivi[]> {
    const where: any = { target_id: targetId, target_type: targetType };
    if (status) where.status = status;
    return this.find({ where, order: { created_at: 'DESC' }, relations: ['sender'] });
  }

  async countInvitationsPending(targetId: number, targetType: string): Promise<number> {
    return this.count({ where: { target_id: targetId, target_type: targetType, status: InvitationSuiviStatus.PENDING }});
  }

  async hasInvitationPending(senderId: number, senderType: string, targetId: number, targetType: string): Promise<boolean> {
    return (await this.count({
      where: {
        sender_id: senderId,
        sender_type: senderType,
        target_id: targetId,
        target_type: targetType,
        status: InvitationSuiviStatus.PENDING
      }
    })) > 0;
  }
}
