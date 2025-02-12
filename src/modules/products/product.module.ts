import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { modelInstances } from 'src/core/model-instances';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ...modelInstances],
  exports: [ProductService],
})
export class ProductModule {}
