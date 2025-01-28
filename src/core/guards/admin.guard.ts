import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_ROLE } from '../enums';

export class AdminGuard implements CanActivate {
  private readonly jwtService = new JwtService({
    secret: process.env.JWTKEY,
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) return false;

    try {
      const user = await this.jwtService.verifyAsync(token);
      return (
        user.role === USER_ROLE.SUPER_ADMIN || user.role === USER_ROLE.ADMIN
      );
    } catch {
      throw new UnauthorizedException('invalid token or user role');
    }
  }
}
