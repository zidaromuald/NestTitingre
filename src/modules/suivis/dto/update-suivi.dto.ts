// modules/suivis/dto/update-suivi.dto.ts
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateSuiviDto {
  @IsOptional()
  @IsBoolean()
  notifications_posts?: boolean;

  @IsOptional()
  @IsBoolean()
  notifications_email?: boolean;
}
