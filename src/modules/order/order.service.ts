import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY } from 'src/core/constants';
import Order from 'src/core/database/models/order.model';
import Product from 'src/core/database/models/product.model';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MailService } from 'src/core/mail/mail.service';
import { User } from 'src/core/database';

@Injectable()
export class OrderService {
  constructor(
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: typeof Product,
    @Inject(REPOSITORY.ORDER)
    private readonly orderRepository: typeof Order,
    @Inject(REPOSITORY.USER)
    private readonly userRepository: typeof User,
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
    const order = await this.orderRepository.create({
      userId,
      products,
      totalAmount,
      status: 'pending',
    });

    // ✅ Fetch user info
    const user = await this.userRepository.findByPk(userId);
    if (user) {
      await this.mailService.sendOrderCreationEmail(
        user.email,
        user.firstName || 'Customer',
        order.id,
        totalAmount,
      );
    }

    return order;
    // // Create the order
    // return this.orderRepository.create({
    //   userId,
    //   products,
    //   totalAmount,
    //   status: 'pending',
    // });
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

    // Store previous status for the email
    const previousStatus = order.status;

    // Update the order
    await order.update(updateOrderDto);

    // If status has changed, send notification email
    if (updateOrderDto.status && updateOrderDto.status !== previousStatus) {
      try {
        // Get user information
        const user = await this.userRepository.findByPk(order.userId);
        if (user) {
          await this.mailService.sendOrderUpdateEmail(
            user.email,
            user.firstName || 'Customer',
            order.id,
            previousStatus,
            updateOrderDto.status,
            order.totalAmount,
          );
        }
      } catch (error) {
        console.error(`Failed to send order update email: ${error.message}`);
        // Continue with the operation even if email fails
      }
    }

    return order;
  }
  // async updateOrder(
  //   id: string,
  //   updateOrderDto: UpdateOrderDto,
  // ): Promise<Order> {
  //   const order = await this.orderRepository.findByPk(id);
  //   if (!order) {
  //     throw new NotFoundException(`Order with id ${id} not found`);
  //   }

  //   return order.update(updateOrderDto);
  // }
  async deleteOrder(id: string): Promise<void> {
    const order = await this.orderRepository.findByPk(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    await order.destroy();
  }
}
