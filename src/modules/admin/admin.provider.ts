import { REPOSITORY } from 'src/core/constants';
import { AdminService } from './admin.service';
import { OrderService } from '../order/order.service';
import { ProductService } from '../products/product.service';
import { UsersService } from '../users/users.service';
import { DeliveryService } from '../delivery/delivery.service';
import { MailService } from 'src/core/mail/mail.service';
import { Delivery, Order, Product, User } from 'src/core/database';

export const adminProviders = [
  AdminService,
  OrderService,
  ProductService,
  UsersService,
  DeliveryService,
  MailService,
  {
    provide: REPOSITORY.ORDER,
    useValue: Order,
  },
  {
    provide: REPOSITORY.PRODUCT,
    useValue: Product,
  },
  {
    provide: REPOSITORY.DELIVERY,
    useValue: Delivery,
  },
  {
    provide: REPOSITORY.USER,
    useValue: User,
  },
];
