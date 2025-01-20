import { REPOSITORY } from 'src/core/constants';
import User from 'src/core/database/models/user.model';

export const usersProviders = [
  {
    provide: REPOSITORY.USER,
    useValue: User,
  },
];
