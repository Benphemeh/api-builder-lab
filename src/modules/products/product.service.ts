import { Body, Inject, Injectable, Post, Req } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { REPOSITORY } from 'src/core/constants';
import Product from 'src/core/database/models/product.model';
import { AuthUser } from 'src/core/interfaces';

@Injectable()
export class ProductService {
  constructor(
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: typeof Product,
  ) {}

  @Post()
  async create(@Body() product: CreateProductDto, @Req() req: AuthUser) {
    const userId = req.user.id;
    return await this.productRepository.create({ ...product, userId });
  }
}
