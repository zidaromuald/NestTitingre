// modules/groupes/dto/update-groupe.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupeDto } from './create-groupe.dto';

export class UpdateGroupeDto extends PartialType(CreateGroupeDto) {
  // Tous les champs de CreateGroupeDto deviennent optionnels
}
