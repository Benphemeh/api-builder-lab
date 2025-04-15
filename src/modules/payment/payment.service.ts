import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import axios from 'axios';
import { REPOSITORY } from 'src/core/constants';
import { Order } from 'src/core/database';

import Payment from 'src/core/database/models/payment.model';

@Injectable()
export class PaymentService {
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @Inject(REPOSITORY.PAYMENT)
    private readonly paymentRepository: typeof Payment, // Inject PaymentRepository
    @Inject(REPOSITORY.ORDER)
    private readonly orderRepository: typeof Order,
  ) {}

  async initializePayment(email: string, amount: number): Promise<any> {
    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Converting to kobo
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Payment initialization failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Payment verification failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createPayment(data: {
    orderId: string;
    reference: string;
    status: 'pending' | 'success' | 'failed';
    amount: number;
  }): Promise<Payment> {
    return this.paymentRepository.create(data); // Save payment record in the database
  }

  async updatePayment(
    reference: string,
    status: 'success' | 'failed',
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { reference },
    });
    if (!payment) {
      throw new Error(`Payment with reference ${reference} not found`);
    }
    return payment.update({ status });
  }
  async handleWebhook(body: any): Promise<void> {
    const { event, data } = body;

    if (event === 'charge.success') {
      const reference = data.reference;
      const status = data.status;
      const amount = data.amount / 100; // Convert from kobo to naira

      // Find the payment record by reference
      const payment = await this.paymentRepository.findOne({
        where: { reference },
      });

      if (!payment) {
        throw new HttpException(
          `Payment with reference ${reference} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Update the payment status to success
      await payment.update({ status });

      // Find the associated order
      const order = await this.orderRepository.findByPk(payment.orderId);

      if (!order) {
        throw new HttpException(
          `Order with id ${payment.orderId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Update the order status to completed
      await order.update({ status: 'completed' });

      console.log(
        `Payment and order updated successfully for reference: ${reference}`,
      );
    } else {
      console.log(`Unhandled event type: ${event}`);
    }
  }
}
