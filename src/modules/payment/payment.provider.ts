import { REPOSITORY } from 'src/core/constants';
import Payment from 'src/core/database/models/payment.model';

export const paymentProviders = [
  {
    provide: REPOSITORY.PAYMENT,
    useValue: Payment,
  },
];
