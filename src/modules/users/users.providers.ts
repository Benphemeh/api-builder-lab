import { REPOSITORY } from 'src/core/constants';
import User from 'src/core/database/models/user.model';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { MailService } from 'src/core/mail/mail.service';
import { CacheService } from '../cache/cache.service';
import { RedisService } from '../redis/redis.service';

export const usersProviders = [
  {
    provide: REPOSITORY.USER,
    useValue: User,
  },
  UsersService,
  JwtService,
  AuthService,
  MailService,
  CacheService,
  RedisService,
];
