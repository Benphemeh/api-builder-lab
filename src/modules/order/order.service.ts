import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY } from 'src/core/constants';
import Order from 'src/core/database/models/order.model';
import Product from 'src/core/database/models/product.model';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MailService } from 'src/core/mail/mail.service';
import { Delivery, User } from 'src/core/database';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: typeof Product,
    @Inject(REPOSITORY.ORDER)
    private readonly orderRepository: typeof Order,
    @Inject(REPOSITORY.USER)
    private readonly userRepository: typeof User,
    @Inject(REPOSITORY.DELIVERY)
    private readonly deliveryRepository: typeof Delivery,
    private readonly mailService: MailService,
    private readonly paymentService: PaymentService,
  ) {}

  async createOrder(
    userId: string,
    products: { productId: string; quantity: number }[],
    deliveryAddress: string,
  ): Promise<Order> {
    const totalAmount = await this.calculateTotal(products);

    // Deduct stock for each product.
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

      await productDetails.update({
        stock: productDetails.stock - product.quantity,
      });
    }
    // Create the order
    const order = await this.orderRepository.create({
      userId,
      products,
      totalAmount,
      deliveryAddress,
      status: 'pending',
    });

    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Send order creation email
    await this.mailService.sendOrderCreationEmail(
      user.email,
      user.firstName || 'Customer',
      order.id,
      totalAmount,
    );

    // Initialize payment with Paystack
    const payment = await this.paymentService.initializePayment(
      user.email,
      totalAmount,
    );

    await this.paymentService.createPayment({
      orderId: order.id,
      reference: payment.data.reference,
      status: 'pending',
      amount: totalAmount,
    });

    return {
      ...order.get({ plain: true }),
      payment: payment.data,
    };
  }

  async verifyOrderPayment(reference: string): Promise<any> {
    const payment = await this.paymentService.verifyPayment(reference);

    if (payment.data.status === 'success') {
      const order = await this.orderRepository.findOne({
        where: { id: payment.data.metadata.orderId },
      });

      if (!order) {
        throw new NotFoundException(
          `Order with id ${payment.data.metadata.orderId} not found`,
        );
      }

      await order.update({ status: 'completed' });

      // Update payment status to success
      await this.paymentService.updatePayment(reference, 'success');

      await this.createDelivery(order);

      return { message: 'Payment verified and order completed', order };
    }
    // Update payment status to failed if verification fails
    await this.paymentService.updatePayment(reference, 'failed');
    throw new NotFoundException('Payment verification failed');
  }

  private async createDelivery(order: Order): Promise<Delivery> {
    const delivery = await this.deliveryRepository.create({
      orderId: order.id,
      deliveryAddress: order.deliveryAddress,
      logisticsProvider: 'DHL',
      status: 'pending',
    });

    console.log(`Delivery created for order ${order.id}`);
    return delivery;
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

    const previousStatus = order.status;
    const updatedOrder = await order.update(updateOrderDto);

    // If the status has changed, send an order update email
    if (updateOrderDto.status && updateOrderDto.status !== previousStatus) {
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
    }

    return updatedOrder;
  }

  async deleteOrder(id: string): Promise<void> {
    const order = await this.orderRepository.findByPk(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    await order.destroy();
  }
}
