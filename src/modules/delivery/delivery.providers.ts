import { REPOSITORY } from 'src/core/constants';
import { Order, User } from 'src/core/database';
import Delivery from 'src/core/database/models/delivery.model';
import { MailService } from 'src/core/mail/mail.service';

export const deliveryProviders = [
  {
    provide: REPOSITORY.DELIVERY,
    useValue: Delivery,
  },
  {
    provide: REPOSITORY.ORDER,
    useValue: Order,
  },
  {
    provide: REPOSITORY.USER,
    useValue: User,
  },
  MailService,
];
