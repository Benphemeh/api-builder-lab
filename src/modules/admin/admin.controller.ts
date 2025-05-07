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
} from '@nestjs/common';
import { AdminGuard } from 'src/core/guards/admin.guard';
import { AdminService } from './admin.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ORDER_STATUS } from 'src/core/enums';
import { Delivery } from 'src/core/database';
import { CreateDeliveryDto } from '../delivery/dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from '../delivery/dto/update-delivery.dto';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // --- Orders Management ---

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
    @Body('status') status: ORDER_STATUS,
  ) {
    return this.adminService.updateOrderStatus(id, status);
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
    return this.adminService.createProduct(createProductDto, req);
  }

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
