import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY } from 'src/core/constants';
import Order from 'src/core/database/models/order.model';
import Product from 'src/core/database/models/product.model';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MailService } from 'src/core/mail/mail.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: typeof Product,
    @Inject(REPOSITORY.ORDER)
    private readonly orderRepository: typeof Order,
    private readonly mailService: MailService, // Inject MailService
  ) {}

  async createOrder(
    userId: string,
    products: { productId: string; quantity: number }[],
  ): Promise<Order> {
    const totalAmount = await this.calculateTotal(products);

    // Deduct stock for each product
    for (const product of products) {
      const productDetails = await this.productRepository.findByPk(
        product.productId,
      );

      if (!productDetails) {
        throw new NotFoundException(
          `Product with id ${product.productId} not found`,
        );
      }

      if (productDetails.stock < product.quantity) {
        throw new NotFoundException(
          `Insufficient stock for product id ${product.productId}`,
        );
      }

      // Deduct stock
      await productDetails.update({
        stock: productDetails.stock - product.quantity,
      });
    }

    // Create the order
    return this.orderRepository.create({
      userId,
      products,
      totalAmount,
      status: 'pending',
    });
  }

  private async calculateTotal(
    products: { productId: string; quantity: number }[],
  ): Promise<number> {
    let total = 0;

    for (const product of products) {
      const productDetails = await this.productRepository.findByPk(
        product.productId,
      );

      if (!productDetails) {
        throw new NotFoundException(
          `Product with id ${product.productId} not found`,
        );
      }

      total += productDetails.price * product.quantity;
    }

    return total;
  }
  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderRepository.findByPk(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async getAllOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.findAll({ where: { userId } });
  }

  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findByPk(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order.update(updateOrderDto);
  }
  async deleteOrder(id: string): Promise<void> {
    const order = await this.orderRepository.findByPk(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    await order.destroy();
  }
}
