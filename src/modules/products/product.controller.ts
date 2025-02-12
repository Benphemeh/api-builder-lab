import { Body, Controller, Post, Req } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { AuthUser } from 'src/core/interfaces';
// import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: AuthUser,
  ) {
    return this.productService.create(createProductDto, req);
  }
}
