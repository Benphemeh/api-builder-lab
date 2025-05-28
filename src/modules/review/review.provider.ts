import { REPOSITORY } from 'src/core/constants';
import { Review } from 'src/core/database';

export const reviewProviders = [
  {
    provide: REPOSITORY.REVIEW,
    useValue: Review,
  },
];
