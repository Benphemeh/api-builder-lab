import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { REPOSITORY } from 'src/core/constants';
import User from 'src/core/database/models/user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(REPOSITORY.USER) private userRepo: typeof User) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Add debug logging
    console.log('JWT payload:', payload);

    // Use sub for user ID instead of id (standard JWT practice)
    const userId = payload.sub || payload.id;

    if (!userId) {
      console.error('No user ID found in JWT payload');
      throw new UnauthorizedException('Invalid token structure');
    }

    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });

      if (!user) {
        console.error(`User with ID ${userId} not found`);
        throw new UnauthorizedException('User not found');
      }

      // Return a proper user object instead of the raw payload
      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      console.error('Error validating JWT:', error.message);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
