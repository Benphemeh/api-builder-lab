import { REPOSITORY } from 'src/core/constants';
import Category from 'src/core/database/models/category.model';

export const categoriesProviders = [
  {
    provide: REPOSITORY.CATEGORY,
    useValue: Category,
  },
];
