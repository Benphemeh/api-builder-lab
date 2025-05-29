import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REPOSITORY } from 'src/core/constants';
import Order from 'src/core/database/models/order.model';
import Product from 'src/core/database/models/product.model';
import { UpdateOrderDto } from './dto/update-order.dto';
import { MailService } from 'src/core/mail/mail.service';
import { Coupon, Delivery, User } from 'src/core/database';
import { PaymentService } from '../payment/payment.service';
import { CartService } from '../cart/cart.service'; // Add this import

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
    @Inject(REPOSITORY.COUPON)
    private readonly couponRepository: typeof Coupon,
    private readonly mailService: MailService,
    private readonly paymentService: PaymentService,
    private readonly cartService: CartService, // Add this line
  ) {}

  async createOrder(
    userId: string,
    products: { productId: string; quantity: number }[],
    deliveryAddress: string,
  ): Promise<Order> {
    return this.createOrderWithProducts(userId, products, deliveryAddress);
  }

  // Add this new method to create order from cart
  async createOrderFromCart(
    userId: string,
    deliveryAddress: string,
    cartId?: string,
  ): Promise<Order> {
    // Convert cart to order format
    const { products, totalAmount } = await this.cartService.convertCartToOrder(
      userId,
      cartId,
    );

    // Use existing createOrder logic but skip total calculation since we have it
    return this.createOrderWithProducts(
      userId,
      products,
      deliveryAddress,
      totalAmount,
    );
  }

  // Refactor existing createOrder to use this helper
  private async createOrderWithProducts(
    userId: string,
    products: { productId: string; quantity: number }[],
    deliveryAddress: string,
    totalAmount?: number,
  ): Promise<Order> {
    const calculatedTotal =
      totalAmount || (await this.calculateTotal(products));

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
      totalAmount: calculatedTotal,
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
      calculatedTotal,
    );

    // Initialize payment with Paystack
    const payment = await this.paymentService.initializePayment(
      user.email,
      calculatedTotal,
      order.id,
    );

    await this.paymentService.createPayment({
      orderId: order.id,
      reference: payment.data.reference,
      status: 'pending',
      amount: calculatedTotal,
    });

    return {
      ...order.get({ plain: true }),
      payment: payment.data,
    };
  }

  async verifyOrderPayment(reference: string): Promise<any> {
    try {
      const payment = await this.paymentService.verifyPayment(reference);

      console.log('Payment Data:', payment);

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

        const user = await this.userRepository.findByPk(order.userId);
        if (!user) {
          throw new NotFoundException(`User with id ${order.userId} not found`);
        }

        // Send invoice email
        await this.mailService.sendInvoiceEmail(
          user.email,
          user.firstName || 'Customer',
          order.id,
          order.totalAmount,
          order.products,
        );

        return {
          message: 'Payment verified, order completed, and invoice sent',
          order,
        };
      } else if (payment.data.status === 'abandoned') {
        // Handle abandoned payment
        await this.paymentService.updatePayment(reference, 'failed');
        throw new BadRequestException(
          'The payment was abandoned. Please try again or contact support if the issue persists.',
        );
      } else {
        // Handle other payment statuses
        await this.paymentService.updatePayment(reference, 'failed');
        throw new BadRequestException(
          `Payment verification failed with status: ${payment.data.status}. Please try again.`,
        );
      }
    } catch (error) {
      console.error('Error during payment verification:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        'An error occurred during payment verification. Please contact support if the issue persists.',
      );
    }
  }

  async applyCoupon(orderId: string, code: string): Promise<Order> {
    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon || coupon.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired coupon');
    }

    const order = await this.orderRepository.findByPk(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.totalAmount =
      order.totalAmount * (1 - coupon.discountPercentage / 100);
    await order.save();

    return order;
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

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.findAll();
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
