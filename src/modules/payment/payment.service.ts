import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import axios from 'axios';
import { REPOSITORY } from 'src/core/constants';
import { Order } from 'src/core/database';

import Payment from 'src/core/database/models/payment.model';
import { MailService } from 'src/core/mail/mail.service';

@Injectable()
export class PaymentService {
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @Inject(REPOSITORY.PAYMENT)
    private readonly paymentRepository: typeof Payment,
    @Inject(REPOSITORY.ORDER)
    private readonly orderRepository: typeof Order,
    private readonly mailService: MailService,
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
    return this.paymentRepository.create(data);
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

    // Update payment status
    await payment.update({ status });

    // If status is 'success', update order and send confirmation email
    if (status === 'success') {
      const order = await this.orderRepository.findByPk(payment.orderId, {
        include: ['user'],
      });

      if (order) {
        await order.update({ status: 'success' });

        const user = order.user;
        await this.mailService.sendOrderPaymentEmail(
          user.email,
          user.firstName || 'Customer',
          order.id,
          payment.amount,
          reference,
        );
      }
    }

    return payment;
  }

  async handleWebhook(body: any): Promise<void> {
    const { event, data } = body;

    if (event === 'charge.success') {
      const reference = data.reference;
      const status = data.status;
      const amount = data.amount / 100; // Convert from kobo to naira.

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

      const order = await this.orderRepository.findByPk(payment.orderId, {
        include: ['user'],
      });

      if (!order) {
        throw new HttpException(
          `Order with id ${payment.orderId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await order.update({ status: 'success' });

      // Send payment confirmation email
      const user = order.user;
      await this.mailService.sendOrderPaymentEmail(
        user.email,
        user.firstName || 'Customer',
        order.id,
        amount,
        reference,
      );
      console.log(
        `Payment and order  successfully updated for reference: ${reference}`,
      );
    } else {
      console.log(`Unhandled event type: ${event}`);
    }
  }
}
