import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DatabaseModule } from 'src/core/database/database.module';
import { MailModule } from 'src/core/mail/mail.module';
import { orderProviders } from './order.provider';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DatabaseModule, MailModule, UsersModule],
  controllers: [OrderController],
  providers: [...orderProviders, OrderService],
  exports: [OrderService],
})
export class OrdersModule {}
