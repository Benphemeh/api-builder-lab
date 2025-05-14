import { REPOSITORY } from 'src/core/constants';
import { AdminService } from './admin.service';
import { OrderService } from '../order/order.service';
import { ProductService } from '../products/product.service';
import { UsersService } from '../users/users.service';
import { DeliveryService } from '../delivery/delivery.service';
import { MailService } from 'src/core/mail/mail.service';
import {
  Coupon,
  Delivery,
  Order,
  Payment,
  Product,
  User,
} from 'src/core/database';
import { PaymentService } from '../payment/payment.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

export const adminProviders = [
  AdminService,
  OrderService,
  ProductService,
  UsersService,
  DeliveryService,
  MailService,
  PaymentService,
  AuthService,
  JwtService,
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
  {
    provide: REPOSITORY.PAYMENT,
    useValue: Payment,
  },
  {
    provide: REPOSITORY.COUPON,
    useValue: Coupon,
  },
];
