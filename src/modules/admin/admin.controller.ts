import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/core/guards/admin.guard';
import { OrderService } from '../order/order.service';
import { ProductService } from '../products/product.service';
import { UsersService } from '../users/users.service';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly usersService: UsersService,
  ) {}

  // --- Orders Management ---
  //   @Get('orders')
  //   async getAllOrders() {
  //     return this.orderService.getAllOrders();
  //   }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Patch('orders/:id')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'completed' | 'canceled',
  ) {
    return this.orderService.updateOrder(id, { status });
  }

  @Delete('orders/:id')
  async deleteOrder(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }

  //   // --- Products Management ---
  //   @Get('products')
  //   async getAllProducts() {
  //     return this.productService.getAllProducts();
  //   }

  //   @Get('products/:id')
  //   async getProductById(@Param('id') id: string) {
  //     return this.productService.getProductById(id);
  //   }

  //   @Post('products')
  //   async createProduct(@Body() createProductDto: any) {
  //     return this.productService.createProduct(createProductDto);
  //   }

  //   @Patch('products/:id')
  //   async updateProduct(@Param('id') id: string, @Body() updateProductDto: any) {
  //     return this.productService.updateProduct(id, updateProductDto);
  //   }

  //   @Delete('products/:id')
  //   async deleteProduct(@Param('id') id: string) {
  //     return this.productService.deleteProduct(id);
  //   }

  //   // --- Customers Management ---
  //   @Get('customers')
  //   async getAllCustomers() {
  //     return this.usersService.getAllUsers();
  //   }

  //   @Get('customers/:id')
  //   async getCustomerById(@Param('id') id: string) {
  //     return this.usersService.getUserById(id);
  //   }

  //   @Delete('customers/:id')
  //   async deleteCustomer(@Param('id') id: string) {
  //     return this.usersService.deleteUser(id);
  //   }
}
