import { REPOSITORY } from 'src/core/constants';
import Order from 'src/core/database/models/order.model';
import Product from 'src/core/database/models/product.model';
import { OrderService } from './order.service';
import { ProductService } from '../products/product.service';

export const orderProviders = [
  {
    provide: REPOSITORY.ORDER,
    useValue: Order,
  },
  {
    provide: REPOSITORY.PRODUCT,
    useValue: Product,
  },
  OrderService,
  ProductService,
];
