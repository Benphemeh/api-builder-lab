import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import User from 'src/core/database/models/user.model';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDTO } from './dto/update-user.dto';
import { AdminGuard } from 'src/core/guards/admin.guard';
import { CacheService } from '../cache/cache.service';
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) {}
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    try {
      if (!id) {
        throw new BadRequestException('User ID is required');
      }
      return this.usersService.getUserById(id);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search = '',
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    /** Cache key includes all query‑params so each combination is stored separately */
    const cacheKey = `users:list:${page}:${limit}:${search}:${role ?? ''}:${status ?? ''}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () =>
        this.usersService.getAllUsers(page, limit, search.trim(), role, status),
      30, // minutes
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDTO) {
    return await this.usersService.updateUserProfile(id, data);
  }
  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return await this.usersService.deleteUser(id);
  }
}
