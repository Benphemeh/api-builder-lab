import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { ProductService } from '../products/product.service';
import { UsersService } from '../users/users.service';
import { Delivery, Product } from 'src/core/database';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { ORDER_STATUS } from 'src/core/enums';
import { DeliveryService } from '../delivery/delivery.service';
import { CreateDeliveryDto } from '../delivery/dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from '../delivery/dto/update-delivery.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly usersService: UsersService,
    private readonly deliveryService: DeliveryService,
  ) {}

  // --- Orders Management ---
  async getAllOrders(): Promise<any> {
    return this.orderService.getAllOrders();
  }

  async getOrderById(id: string): Promise<any> {
    const order = await this.orderService.getOrderById(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async updateOrderStatus(id: string, status: ORDER_STATUS): Promise<any> {
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
  async getProductById(id: string): Promise<Product> {
    const product = await this.productService.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
  async createProduct(
    createProductDto: CreateProductDto,
    req: any,
  ): Promise<Product> {
    const user = req.user;

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.id) {
      throw new BadRequestException('User ID is required');
    }

    const product = await this.productService.create(createProductDto, req);

    console.log(`Product created successfully for user ID: ${user.id}`);
    return product;
  }

  async updateProduct(id: string, updateProductDto: any): Promise<any> {
    return this.productService.updateProduct(id, updateProductDto);
  }

  async deleteProduct(id: string): Promise<any> {
    return this.productService.deleteProduct(id);
  }

  async getDeliveryByOrderId(orderId: string): Promise<Delivery> {
    return this.deliveryService.getDeliveryByOrderId(orderId);
  }

  async createDelivery(dto: CreateDeliveryDto): Promise<Delivery> {
    return this.deliveryService.createDelivery(dto);
  }

  async updateDeliveryStatus(
    orderId: string,
    dto: UpdateDeliveryStatusDto,
  ): Promise<Delivery> {
    return this.deliveryService.updateDeliveryStatus(orderId, dto);
  }
}
