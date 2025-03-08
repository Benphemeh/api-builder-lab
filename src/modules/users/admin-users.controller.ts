import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminGuard } from 'src/core/guards/admin.guard';
import { CreateUserDTO } from './dto/user.dto';
// import { AdminGuard } from 'src/core/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() adminLoginDto: CreateUserDTO) {
    const admin = await this.usersService.validateAdmin(
      adminLoginDto.email,
      adminLoginDto.password,
    );

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = await this.usersService.generateToken(admin);

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
      access_token: token,
    };
  }

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
