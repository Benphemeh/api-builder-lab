import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { DatabaseModule } from 'src/core/database/database.module';
import { productProviders } from './product.provider';
import { MailModule } from 'src/core/mail/mail.module';

@Module({
  imports: [DatabaseModule, MailModule],
  controllers: [ProductController],
  providers: [...productProviders],
  exports: [ProductService],
})
export class ProductsModule {}
