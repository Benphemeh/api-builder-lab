import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OrdersModule } from '../order/order.module';
import { paymentProviders } from './payment.provider';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  providers: [...paymentProviders, PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
