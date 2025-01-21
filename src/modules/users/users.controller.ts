import { Controller, Delete, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import User from 'src/core/database/models/user.model';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  //   @UseGuards(JwtGuard)
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<User> {
    return await this.usersService.getUserById(id);
  }
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return await this.usersService.deleteUser(id);
  }
}
