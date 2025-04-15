import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OrdersModule } from '../order/order.module';
import { paymentProviders } from './payment.provider';
import { PaymentController } from './payment.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  providers: [...paymentProviders, PaymentService, JwtService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
