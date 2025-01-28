import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminGuard } from 'src/core/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAllUsers() {
    return await this.usersService.findAllUsers();
  }
}
