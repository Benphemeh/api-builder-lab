import { Module } from '@nestjs/common';
import { OrdersModule } from '../order/order.module';
import { PaymentModule } from '../payment/payment.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { MailModule } from 'src/core/mail/mail.module';
import { webhookProviders } from './webhook.providers';

@Module({
  imports: [PaymentModule, OrdersModule, MailModule],
  controllers: [WebhookController],
  providers: [WebhookService, ...webhookProviders],
})
export class WebhooksModule {}
