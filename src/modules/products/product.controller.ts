import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { AuthUser } from 'src/core/interfaces';
import { JwtGuard } from '../auth/jwt-guard';
// import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: AuthUser,
  ) {
    return this.productService.create(createProductDto);
  }
}
