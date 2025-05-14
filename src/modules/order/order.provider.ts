import { REPOSITORY } from 'src/core/constants';
import Order from 'src/core/database/models/order.model';
import Product from 'src/core/database/models/product.model';
import User from 'src/core/database/models/user.model';
import { OrderService } from './order.service';
import { ProductService } from '../products/product.service';
import Delivery from 'src/core/database/models/delivery.model';
import { DeliveryService } from '../delivery/delivery.service';
import { Coupon } from 'src/core/database';

export const orderProviders = [
  {
    provide: REPOSITORY.ORDER,
    useValue: Order,
  },
  {
    provide: REPOSITORY.PRODUCT,
    useValue: Product,
  },
  {
    provide: REPOSITORY.USER,
    useValue: User,
  },
  {
    provide: REPOSITORY.DELIVERY,
    useValue: Delivery,
  },
  {
    provide: REPOSITORY.COUPON,
    useValue: Coupon,
  },
  OrderService,
  ProductService,
  DeliveryService,
];
