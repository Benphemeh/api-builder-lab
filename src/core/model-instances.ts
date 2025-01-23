import { REPOSITORY } from './constants';
import User from './database/models/user.model';

export const modelInstances = [
  {
    provide: REPOSITORY.USER,
    useValue: User,
  },
];
