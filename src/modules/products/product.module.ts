import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { DatabaseModule } from 'src/core/database/database.module';
import { productProviders } from './product.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductController],
  providers: [...productProviders],
  exports: [ProductService],
})
export class ProductsModule {}
