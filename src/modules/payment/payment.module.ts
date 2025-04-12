import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OrdersModule } from '../order/order.module';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
