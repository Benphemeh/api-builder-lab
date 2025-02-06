import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import User from 'src/core/database/models/user.model';
import { AdminGuard } from 'src/core/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDTO } from './dto/update-user.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    return await this.usersService.getUserById(id);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.usersService.getAllUsers();
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() data: UpdateUserDTO) {
    return await this.usersService.updateUserProfile(id, data);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return await this.usersService.deleteUser(id);
  }
}
