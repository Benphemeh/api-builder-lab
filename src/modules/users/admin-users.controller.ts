import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminGuard } from 'src/core/guards/admin.guard';
// import { AdminGuard } from 'src/core/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAllUsers() {
    return await this.usersService.getAllUsers();
  }
  @Get(':id')
  async findOneUser(@Param('id') id: string) {
    return await this.usersService.getUserById(id);
  }
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }
}
