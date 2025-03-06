import { REPOSITORY } from 'src/core/constants';
import { Product, User } from 'src/core/database';
import { ProductService } from './product.service';
import { UsersService } from '../users/users.service';

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
];
