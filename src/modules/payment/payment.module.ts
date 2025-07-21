import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OrdersModule } from '../order/order.module';
import { paymentProviders } from './payment.provider';
import { PaymentController } from './payment.controller';
import { JwtService } from '@nestjs/jwt';
import { MailModule } from 'src/core/mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [forwardRef(() => OrdersModule), MailModule, ConfigModule],
  providers: [...paymentProviders, PaymentService, JwtService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
