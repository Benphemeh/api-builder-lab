import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { ProductService } from '../products/product.service';
import { UsersService } from '../users/users.service';
import { Product } from 'src/core/database';

@Injectable()
export class AdminService {
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly usersService: UsersService,
  ) {}

  // --- Orders Management ---
  //   async getAllOrders(): Promise<any> {
  //     return this.orderService.getAllOrders();
  //   }

  async getOrderById(id: string): Promise<any> {
    const order = await this.orderService.getOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async updateOrderStatus(
    id: string,
    status: 'pending' | 'completed' | 'canceled',
  ): Promise<any> {
    return this.orderService.updateOrder(id, { status });
  }

  async deleteOrder(id: string): Promise<any> {
    return this.orderService.deleteOrder(id);
  }

  // --- Products Management ---
  async getAllProducts(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
    category: string,
    size?: string,
    breed?: string,
    type?: string,
  ): Promise<{ data: Product[]; total: number }> {
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
  //   async getProductById(id: string): Promise<any> {
  //     const product = await this.productService.getProductById(id);
  //     if (!product) {
  //       throw new NotFoundException(`Product with id ${id} not found`);
  //     }
  //     return product;
  //   }

  //   async createProduct(createProductDto: any): Promise<any> {
  //     return this.productService.createProduct(createProductDto);
  //   }

  //   async updateProduct(id: string, updateProductDto: any): Promise<any> {
  //     return this.productService.updateProduct(id, updateProductDto);
  //   }

  //   async deleteProduct(id: string): Promise<any> {
  //     return this.productService.deleteProduct(id);
  //   }

  //   // --- Customers Management ---
  //   async getAllCustomers(): Promise<any> {
  //     return this.usersService.getAllUsers();
  //   }

  //   async getCustomerById(id: string): Promise<any> {
  //     const user = await this.usersService.getUserById(id);
  //     if (!user) {
  //       throw new NotFoundException(`Customer with id ${id} not found`);
  //     }
  //     return user;
  //   }

  //   async deleteCustomer(id: string): Promise<any> {
  //     return this.usersService.deleteUser(id);
  //   }
}
