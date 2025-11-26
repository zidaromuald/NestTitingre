// modules/suivis/repositories/invitation-suivi.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InvitationSuivi, InvitationSuiviStatus } from '../entities/invitation-suivi.entity';

@Injectable()
export class InvitationSuiviRepository extends Repository<InvitationSuivi> {
  constructor(private dataSource: DataSource) {
    super(InvitationSuivi, dataSource.createEntityManager());
  }

  async findInvitation(senderId: number, senderType: string, receiverId: number, receiverType: string): Promise<InvitationSuivi | null> {
    return this.findOne({
      where: {
        sender_id: senderId,
        sender_type: senderType,
        receiver_id: receiverId,
        receiver_type: receiverType
      }
    });
  }

  async findInvitationsEnvoyees(senderId: number, senderType: string, status?: InvitationSuiviStatus): Promise<InvitationSuivi[]> {
    const where: any = { sender_id: senderId, sender_type: senderType };
    if (status) where.status = status;
    return this.find({ where, order: { created_at: 'DESC' } });
  }

  async findInvitationsRecues(receiverId: number, receiverType: string, status?: InvitationSuiviStatus): Promise<InvitationSuivi[]> {
    const where: any = { receiver_id: receiverId, receiver_type: receiverType };
    if (status) where.status = status;
    return this.find({ where, order: { created_at: 'DESC' } });
  }

  async countInvitationsPending(receiverId: number, receiverType: string): Promise<number> {
    return this.count({ where: { receiver_id: receiverId, receiver_type: receiverType, status: InvitationSuiviStatus.PENDING }});
  }

  async hasInvitationPending(senderId: number, senderType: string, receiverId: number, receiverType: string): Promise<boolean> {
    return (await this.count({
      where: {
        sender_id: senderId,
        sender_type: senderType,
        receiver_id: receiverId,
        receiver_type: receiverType,
        status: InvitationSuiviStatus.PENDING
      }
    })) > 0;
  }
}
