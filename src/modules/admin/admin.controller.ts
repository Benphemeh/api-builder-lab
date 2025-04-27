import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/core/guards/admin.guard';
import { AdminService } from './admin.service';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // --- Orders Management ---
  //   @Get('orders')
  //   async getAllOrders() {
  //     return this.adminService.getAllOrders();
  //   }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.adminService.getOrderById(id);
  }

  @Patch('orders/:id')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'completed' | 'canceled',
  ) {
    return this.adminService.updateOrderStatus(id, status);
  }

  @Delete('orders/:id')
  async deleteOrder(@Param('id') id: string) {
    return this.adminService.deleteOrder(id);
  }

  // --- Products Management ---
  //   @Get('products')
  //   async getAllProducts() {
  //     return this.adminService.getAllProducts();
  //   }

  //   @Get('products/:id')
  //   async getProductById(@Param('id') id: string) {
  //     return this.adminService.getProductById(id);
  //   }

  //   @Post('products')
  //   async createProduct(@Body() createProductDto: any) {
  //     return this.adminService.createProduct(createProductDto);
  //   }

  //   @Patch('products/:id')
  //   async updateProduct(@Param('id') id: string, @Body() updateProductDto: any) {
  //     return this.adminService.updateProduct(id, updateProductDto);
  //   }

  //   @Delete('products/:id')
  //   async deleteProduct(@Param('id') id: string) {
  //     return this.adminService.deleteProduct(id);
  //   }

  //   // --- Customers Management ---
  //   @Get('customers')
  //   async getAllCustomers() {
  //     return this.adminService.getAllCustomers();
  //   }

  //   @Get('customers/:id')
  //   async getCustomerById(@Param('id') id: string) {
  //     return this.adminService.getCustomerById(id);
  //   }

  //   @Delete('customers/:id')
  //   async deleteCustomer(@Param('id') id: string) {
  //     return this.adminService.deleteCustomer(id);
  //   }
}
