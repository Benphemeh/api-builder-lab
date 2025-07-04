import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Post,
  Req,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import { AdminGuard } from 'src/core/guards/admin.guard';
import { AdminService } from './admin.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { Delivery } from 'src/core/database';
import { CreateDeliveryDto } from '../delivery/dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from '../delivery/dto/update-delivery.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductService } from '../products/product.service';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { CreateCouponDto } from './dto/coupon.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheService } from '../cache/cache.service';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly productService: ProductService,
    private readonly cacheService: CacheService,
  ) {}

  // -- Order management --

  @Get('orders')
  async getAllOrders(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const keyParts = ['admin:orders:list'];

    if (search) keyParts.push(`search:${search}`);
    if (status) keyParts.push(`status:${status}`);
    if (fromDate) keyParts.push(`fromDate:${fromDate}`);
    if (toDate) keyParts.push(`toDate:${toDate}`);

    const cacheKey = keyParts.join('-');

    return this.cacheService.getOrSet(
      cacheKey,
      () =>
        this.adminService.getAllOrders({ search, status, fromDate, toDate }),
      30,
    );
  }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    const order = await this.adminService.getOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  @Patch('orders/:id')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(id, updateOrderStatusDto.status);
  }

  @Delete('orders/:id')
  async deleteOrder(@Param('id') id: string) {
    return this.adminService.deleteOrder(id);
  }

  // -- Product management --

  @Post('products')
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Req() req: any,
  ) {
    const user = req.user;
    if (user && user.role === 'admin' && createProductDto.userId) {
      console.log(
        `Admin creating product for user ID: ${createProductDto.userId}`,
      );
      return this.adminService.create(createProductDto, req);
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.id) {
      throw new BadRequestException('User ID is required');
    }

    createProductDto.userId = user.id;
    console.log(`Creating product for user ID: ${user.id}`);
    return this.adminService.create(createProductDto, req);
  }

  @Get('products')
  async getAllProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('category') category = '',
    @Query('size') size?: string,
    @Query('breed') breed?: string,
    @Query('type') type?: string,
  ) {
    const keyParts = [
      `products`,
      `page:${page}`,
      `limit:${limit}`,
      `search:${search}`,
      `sortBy:${sortBy}`,
      `sortOrder:${sortOrder}`,
    ];
    if (category) keyParts.push(`category:${category}`);
    if (size) keyParts.push(`size:${size}`);
    if (breed) keyParts.push(`breed:${breed}`);
    if (type) keyParts.push(`type:${type}`);

    const cacheKey = `admin:products:list:${keyParts.join('')}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () =>
        this.adminService.getAllProducts(
          +page,
          +limit,
          search,
          sortBy,
          sortOrder,
          category,
          size,
          breed,
          type,
        ),
      30,
    );
  }
  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    const cacheKey = `admin:product:detail:${id}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const product = await this.adminService.getProductById(id);
        if (!product) {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
      },
      30,
    );
  }

  @Patch('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.adminService.updateProduct(id, updateProductDto);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Post('products/bulk-upload')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUploadProducts(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.adminService.bulkUploadProducts(file, req);
  }

  // -- delivery management --

  @Post('deliveries')
  async createDelivery(@Body() dto: CreateDeliveryDto): Promise<Delivery> {
    return this.adminService.createDelivery(dto);
  }

  @Get('deliveries/:orderId')
  async getDeliveryByOrderId(
    @Param('orderId') orderId: string,
  ): Promise<Delivery> {
    return this.adminService.getDeliveryByOrderId(orderId);
  }
  @Get('deliveries')
  async getAllDeliveries(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const keyParts = ['deliveries'];

    if (search) keyParts.push(`search:${search}`);
    if (status) keyParts.push(`status:${status}`);
    if (fromDate) keyParts.push(`fromDate:${fromDate}`);
    if (toDate) keyParts.push(`toDate:${toDate}`);

    const cacheKey = `admin:deliveries:list:${keyParts.join(':')}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () =>
        this.adminService.getAllDeliveries({
          search,
          status,
          fromDate,
          toDate,
        }),
      30,
    );
  }

  @Patch('deliveries/:orderId/status')
  async updateDeliveryStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateDeliveryStatusDto,
  ): Promise<Delivery> {
    return this.adminService.updateDeliveryStatus(orderId, dto);
  }

  // -- coupon management --

  @Post('coupon')
  async createCoupon(@Body() createCouponDto: CreateCouponDto) {
    return this.adminService.createCoupon(createCouponDto);
  }
  @Get('coupon/:code')
  async getCouponByCode(@Param('code') code: string) {
    const coupon = await this.adminService.getCouponByCode(code);
    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }
    return coupon;
  }

  @Get('coupons')
  async getAllCoupons(
    @Query('search') search?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.adminService.getAllCoupons({ search, fromDate, toDate });
  }
  @Delete('coupons/:id')
  async deleteCoupon(@Param('id') id: string) {
    return this.adminService.deleteCoupon(id);
  }
}
