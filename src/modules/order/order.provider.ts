import { REPOSITORY } from 'src/core/constants';
import Order from 'src/core/database/models/order.model';
import Product from 'src/core/database/models/product.model';
import { OrderService } from './order.service';
import { ProductService } from '../products/product.service';
import { User } from 'src/core/database';
import Delivery from 'src/core/database/models/delivery.model';
import { DeliveryService } from '../delivery/delivery.service';

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
  OrderService,
  ProductService,
  DeliveryService,
];
