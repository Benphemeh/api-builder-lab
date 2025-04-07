import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'sequelize-typescript';
import { REPOSITORY } from 'src/core/constants';

import Order from 'src/core/database/models/order.model';
import Product from 'src/core/database/models/product.model';

@Injectable()
export class OrderService {
  constructor(
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: Repository<Product>,
    @Inject(REPOSITORY.ORDER)
    private readonly orderRepository: Repository<Order>,
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
          `Product with ID ${product.productId} not found`,
        );
      }

      total += productDetails.price * product.quantity;
    }

    return total;
  }
}
