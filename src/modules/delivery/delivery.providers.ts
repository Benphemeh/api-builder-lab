import { REPOSITORY } from 'src/core/constants';
import Delivery from 'src/core/database/models/delivery.model';

export const deliveryProviders = [
  {
    provide: REPOSITORY.DELIVERY,
    useValue: Delivery,
  },
];
