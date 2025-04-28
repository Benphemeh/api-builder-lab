import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { JwtGuard } from '../guards/jwt-guard';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @UseGuards(JwtGuard)
  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    console.log('user from request:', (req as any).user);
    return this.productService.create(createProductDto, req);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOneProduct(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
  @UseGuards(JwtGuard)
  @Get()
  async getAllProducts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('category') category: string = '',
    @Query('size') size?: string,
    @Query('breed') breed?: string,
    @Query('type') type?: string,
  ) {
    return this.productService.findAll(
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      category,
      size,
      breed,
      type,
    );
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return await this.productService.updateProduct(id, updateProductDto);
  }
  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productService.deleteProduct(id);
  }
}
