import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './core/mail/mail.module';
import { ProductsModule } from './modules/products/product.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LoggerMiddleware } from './core/middleware/loggermiddleware';
import { ApiLoggerModule } from './core/middleware/api-builder-logger/api-logger.module';
import { InternalCacheModule } from './modules/cache/cache.module';
import { OrdersModule } from './modules/order/order.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { AdminModule } from './modules/admin/admin.module';
import { PaymentModule } from './modules/payment/payment.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewModule } from './modules/review/review.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MetricsController } from './modules/prometheus/metrics.controller';
import { WebhooksModule } from './modules/webhooks/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    WebhooksModule,
    AdminModule,
    MailModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    PaymentModule,
    WishlistModule,
    ReviewModule,
    CartModule,
    CategoriesModule,
    DeliveryModule,
    ApiLoggerModule,
    WishlistModule,
    InternalCacheModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRATION },
    }),
  ],
  controllers: [AppController, MetricsController],
  providers: [AppService, JwtService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
