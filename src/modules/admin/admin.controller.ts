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
} from '@nestjs/common';
import { AdminGuard } from 'src/core/guards/admin.guard';
import { AdminService } from './admin.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { Delivery } from 'src/core/database';
import { CreateDeliveryDto } from '../delivery/dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from '../delivery/dto/update-delivery.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductService } from '../products/product.service';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly productService: ProductService,
  ) {}

  @Get('orders')
  async getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.adminService.getOrderById(id);
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
    return this.adminService.getAllProducts(
      +page,
      +limit,
      search,
      sortBy,
      sortOrder,
      category,
      size,
      breed,
      type,
    );
  }

  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return this.adminService.getProductById(id);
  }

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
  // async createProduct(
  //   @Body() createProductDto: CreateProductDto,
  //   @Req() req: any,
  // ) {
  //   const user = req.user;

  //   // If the user is an admin, allow userId to be passed in the request body
  //   if (user && user.role === 'admin' && createProductDto.userId) {
  //     console.log(
  //       `Admin creating product for user ID: ${createProductDto.userId}`,
  //     );
  //     return this.adminService.createProduct(createProductDto, req);
  //   }

  // For regular users, ensure userId is extracted from req.user
  //   if (!user) {
  //     throw new BadRequestException('User not found');
  //   }

  //   if (!user.id) {
  //     throw new BadRequestException('User ID is required');
  //   }

  //   createProductDto.userId = user.id; // Attach userId from req.user
  //   console.log(`Creating product for user ID: ${user.id}`);
  //   return this.adminService.createProduct(createProductDto, req);
  // }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: any) {
    return this.adminService.updateProduct(id, updateProductDto);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Get('deliveries/:orderId')
  async getDeliveryByOrderId(
    @Param('orderId') orderId: string,
  ): Promise<Delivery> {
    return this.adminService.getDeliveryByOrderId(orderId);
  }

  @Post('deliveries')
  async createDelivery(@Body() dto: CreateDeliveryDto): Promise<Delivery> {
    return this.adminService.createDelivery(dto);
  }

  @Patch('deliveries/:orderId/status')
  async updateDeliveryStatus(
    @Param('orderId') orderId: string,
    @Body() dto: UpdateDeliveryStatusDto,
  ): Promise<Delivery> {
    return this.adminService.updateDeliveryStatus(orderId, dto);
  }
}
