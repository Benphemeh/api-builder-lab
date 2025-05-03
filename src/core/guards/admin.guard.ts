import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_ROLE } from '../enums';

export class AdminGuard implements CanActivate {
  private readonly jwtService = new JwtService({
    secret: process.env.JWT_SECRET,
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

      if (
        user.role === USER_ROLE.SUPER_ADMIN ||
        user.role === USER_ROLE.ADMIN
      ) {
        request.user = user; // Attach the user to the request for further use
        return true;
      } else {
        throw new UnauthorizedException('User does not have admin privileges');
      }
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      throw new UnauthorizedException('Invalid token or user role');
    }
  }
}
// import {
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { USER_ROLE } from '../enums';

// export class AdminGuard implements CanActivate {
//   private readonly jwtService = new JwtService({
//     secret: process.env.JWTKEY,
//   });

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = request.headers.authorization?.split(' ')[1];
//     if (!token) return false;

//     try {
//       const user = await this.jwtService.verifyAsync(token);
//       return (
//         user.role === USER_ROLE.SUPER_ADMIN || user.role === USER_ROLE.ADMIN
//       );
//     } catch {
//       throw new UnauthorizedException('invalid token or user role');
//     }
//   }
// }
