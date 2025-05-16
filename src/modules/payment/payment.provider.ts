import { REPOSITORY } from 'src/core/constants';
import Order from 'src/core/database/models/order.model';
import Payment from 'src/core/database/models/payment.model';

export const paymentProviders = [
  {
    provide: REPOSITORY.PAYMENT,
    useValue: Payment,
  },
  {
    provide: REPOSITORY.ORDER,
    useValue: Order,
  },
];
