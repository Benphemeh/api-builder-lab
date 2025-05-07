import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_ROLE } from '../enums';

export class AdminGuard implements CanActivate {
  private readonly jwtService = new JwtService({
    secret: process.env.JWT_SECRET, // Use the correct secret
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const user = await this.jwtService.verifyAsync(token);
      console.log('Decoded token:', user); // Log the decoded token
      console.log('User role:', user.role); // Log the role field

      if (!user.role) {
        console.error('Role is missing in the token payload');
        throw new UnauthorizedException('Role is missing in the token');
      }

      if (
        user.role === USER_ROLE.SUPER_ADMIN ||
        user.role === USER_ROLE.ADMIN
      ) {
        request.user = user;
        return true;
      } else {
        console.error('User does not have admin privileges:', user.role);
        throw new UnauthorizedException('User does not have admin privileges');
      }
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      throw new UnauthorizedException('Invalid token or user role');
    }
  }
}
