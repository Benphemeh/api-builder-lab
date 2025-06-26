import { REPOSITORY } from 'src/core/constants';
import User from 'src/core/database/models/user.model';
import Product from 'src/core/database/models/product.model';
import { ProductService } from './product.service';
import { UsersService } from '../users/users.service';
import { CacheService } from '../cache/cache.service';
import { RedisService } from '../redis/redis.service';

export const productProviders = [
  {
    provide: REPOSITORY.PRODUCT,
    useValue: Product,
  },
  {
    provide: REPOSITORY.USER,
    useValue: User,
  },
  ProductService,
  UsersService,
  CacheService,
  RedisService,
];
