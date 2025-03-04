import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { JwtGuard } from '../auth/jwt-guard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    return this.productService.create(createProductDto, req);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll() {
    return this.productService.findAll();
  }
}
