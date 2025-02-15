import { REPOSITORY } from './constants';
import ActivityModel from './database/models/activity-log.model';
import Log from './database/models/log.model';
import Product from './database/models/product.model';
import User from './database/models/user.model';

export const modelInstances = [
  {
    provide: REPOSITORY.USER,
    useValue: User,
  },
  {
    provide: REPOSITORY.PRODUCT,
    useValue: Product,
  },
  {
    provide: REPOSITORY.LOG,
    useValue: Log,
  },
  {
    provide: REPOSITORY.ACTIVITY,
    useValue: ActivityModel,
  },
];
