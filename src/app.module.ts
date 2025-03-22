import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './core/mail/mail.module';
import { ProductsModule } from './modules/products/product.module';
import { JwtService } from '@nestjs/jwt';
import { LoggerMiddleware } from './core/middleware/loggermiddleware';
import { ApiLoggerModule } from './core/middleware/api-builder-logger/api-logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    MailModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    ApiLoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
