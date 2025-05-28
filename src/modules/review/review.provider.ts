import { REPOSITORY } from 'src/core/constants';
import { Product, Review } from 'src/core/database';

export const reviewProviders = [
  {
    provide: REPOSITORY.REVIEW,
    useValue: Review,
  },
  {
    provide: REPOSITORY.PRODUCT,
    useValue: Product,
  },
];
