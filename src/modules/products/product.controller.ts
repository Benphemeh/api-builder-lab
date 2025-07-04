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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';
import { JwtGuard } from '../guards/jwt-guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheService } from '../cache/cache.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cacheService: CacheService,
  ) {}
  @UseGuards(JwtGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.create(createProductDto, req, file);
  }
  @Get('filter')
  async getFilteredProducts(
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('brand') brand?: string,
    @Query('minRating') minRating?: number,
  ) {
    return this.productService.getFilteredProducts({
      categoryId,
      minPrice,
      maxPrice,
      brand,
      minRating,
    });
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async findOneProduct(@Param('id') id: string) {
    const cacheKey = `products:detail:${id}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () => this.productService.findOne(id),
      10,
    );
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
    const cacheKey = `products:list:${page}:${limit}:${search}:${sortBy}:${sortOrder}:${category}:${size}:${breed}:${type}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () =>
        this.productService.findAll(
          page,
          limit,
          search,
          sortBy,
          sortOrder,
          category,
          size,
          breed,
          type,
        ),
      10,
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
  @Patch(':id/restock')
  async restockProduct(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.productService.restockProduct(id, quantity);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productService.deleteProduct(id);
  }
}
