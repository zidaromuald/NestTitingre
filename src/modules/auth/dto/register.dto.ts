// modules/auth/dto/register.dto.ts
export { CreateUserDto as RegisterUserDto } from '../../users/dto/create-user.dto';
export { CreateSocieteDto as RegisterSocieteDto } from '../../societes/dto/create-societe.dto';

// modules/auth/dto/login.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifiant: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
