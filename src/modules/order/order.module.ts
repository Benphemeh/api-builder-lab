import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DatabaseModule } from 'src/core/database/database.module';
import { MailModule } from 'src/core/mail/mail.module';
import { orderProviders } from './order.provider';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule,
    MailModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRATION },
    }),
  ],
  controllers: [OrderController],
  providers: [...orderProviders, OrderService],
  exports: [OrderService],
})
export class OrdersModule {}
