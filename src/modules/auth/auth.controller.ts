import {
  Controller,
  Body,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from 'src/core/interfaces';
import { CreateUserDTO } from '../users/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Body() data: LoginDto, @Req() req: AuthUser) {
    try {
      return req.user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  //   @Post('login')
  //   async login(@Request() req) {
  //     return await this.authService.login(req.user);
  //   }

  @Post('signup')
  async signUp(@Body() user: CreateUserDTO) {
    return await this.authService.create(user);
  }
}
