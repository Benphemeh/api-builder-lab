import { REPOSITORY } from 'src/core/constants';
import { Product } from 'src/core/database';
import { ProductService } from './product.service';

export const productProviders = [
  {
    provide: REPOSITORY.PRODUCT,
    useValue: Product,
  },
  ProductService,
];
