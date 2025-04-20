import { REPOSITORY } from 'src/core/constants';
import { Delivery } from 'src/core/database';

export const deliveryProviders = [
  {
    provide: REPOSITORY.DELIVERY,
    useValue: Delivery,
  },
];
