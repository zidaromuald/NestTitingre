// modules/users/controllers/user.controller.ts
import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserService } from '../services/user.service';
import { SearchUserDto } from '../dto/search-user.dto';
import { AutocompleteDto } from '../dto/autocomplete.dto';
import { User } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  async search(
    @Query(ValidationPipe) searchDto: SearchUserDto,
    @CurrentUser('id') currentUserId: number,
  ) {
    const result = await this.userService.search(searchDto, currentUserId);
    return {
      message: 'Recherche effectuée avec succès',
      ...result,
    };
  }

  @Get('autocomplete')
  async autocomplete(
    @Query(ValidationPipe) dto: AutocompleteDto,
    @CurrentUser('id') currentUserId: number,
  ) {
    const data = await this.userService.autocomplete(dto.term, currentUserId);
    return {
      message: 'Autocomplétion effectuée avec succès',
      data,
    };
  }
}
