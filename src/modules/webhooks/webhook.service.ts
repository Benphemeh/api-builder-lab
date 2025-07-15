import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentService } from '../payment/payment.service';
import { OrderService } from '../order/order.service';
import { MailService } from 'src/core/mail/mail.service';
import { PaystackWebhookDto } from './dto/webhook.dto';
import { REPOSITORY } from 'src/core/constants';
import { PAYMENT_STATUS } from 'src/core/enums';
import { WebhookEvent } from 'src/core/database/models/webhook.model';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private configService: ConfigService,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private mailService: MailService,
    @Inject(REPOSITORY.WEBHOOK_EVENT) // Add this to your constants
    private readonly webhookEventRepository: typeof WebhookEvent,
  ) {}

  /**
   * Verify webhook signature to ensure it's from Paystack
   */
  verifyPaystackSignature(rawBody: string, signature: string): boolean {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!secret) {
      this.logger.error('PAYSTACK_SECRET_KEY not configured');
      return false;
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody, 'utf8')
      .digest('hex');

    const isValid = hash === signature;

    if (!isValid) {
      this.logger.warn('Webhook signature verification failed', {
        calculated: hash,
        received: signature,
      });
    }

    return isValid;
  }

  /**
   * Process webhook events with idempotency
   */
  async processWebhookEvent(event: PaystackWebhookDto): Promise<void> {
    const { event: eventType, data } = event;

    this.logger.log(`Processing webhook event: ${eventType}`, {
      reference: data.reference,
      amount: data.amount,
    });

    // Idempotency check - prevent duplicate processing
    const isAlreadyProcessed = await this.checkIfEventProcessed(
      data.reference,
      eventType,
    );

    if (isAlreadyProcessed) {
      this.logger.warn(`Event already processed: ${data.reference}`);
      return;
    }

    try {
      switch (eventType) {
        case 'charge.success':
          await this.handleChargeSuccess(data);
          break;

        case 'charge.failed':
          await this.handleChargeFailed(data);
          break;

        // Remove transfer methods since they don't exist yet
        // case 'transfer.success':
        //   await this.handleTransferSuccess(data);
        //   break;

        // case 'transfer.failed':
        //   await this.handleTransferFailed(data);
        //   break;

        default:
          this.logger.warn(`Unhandled event type: ${eventType}`);
      }

      // Mark event as processed
      await this.markEventAsProcessed(data.reference, eventType, data);
    } catch (error) {
      this.logger.error(`Failed to process webhook event: ${eventType}`, {
        reference: data.reference,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  private async handleChargeSuccess(data: any): Promise<void> {
    const { reference, amount } = data;
    const amountInNaira = amount / 100; // Convert from kobo

    try {
      // Use your existing updatePayment method
      const payment = await this.paymentService.updatePayment(
        reference,
        PAYMENT_STATUS.SUCCESS,
      );

      this.logger.log(`✅ Payment successful: ${reference}`, {
        amount: amountInNaira,
        paymentId: payment.id,
      });

      // Payment service already handles order update and email sending
      // No need to duplicate that logic here
    } catch (error) {
      this.logger.error(`Failed to handle charge success: ${reference}`, {
        error: error.message,
      });
      throw error;
    }
  }

  private async handleChargeFailed(data: any): Promise<void> {
    const { reference, gateway_response } = data;

    try {
      // Use your existing updatePayment method
      await this.paymentService.updatePayment(reference, PAYMENT_STATUS.FAILED);

      this.logger.log(`❌ Payment failed: ${reference}`, {
        reason: gateway_response,
      });

      // Send failure notification email using existing mail service
      if (data.customer && data.customer.email) {
        await this.sendPaymentFailureNotification(
          data.customer.email,
          `${data.customer.first_name} ${data.customer.last_name}`,
          reference,
          gateway_response,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to handle charge failed: ${reference}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Send payment failure notification using existing mail service
   */
  private async sendPaymentFailureNotification(
    email: string,
    customerName: string,
    reference: string,
    reason: string,
  ): Promise<void> {
    try {
      const subject = `Payment Failed - Reference: ${reference}`;
      const content = `
        <p>Dear ${customerName},</p>
        <p>We regret to inform you that your payment with reference <strong>${reference}</strong> has failed.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please try again or contact our support team if you continue to experience issues.</p>
        <p>Best regards,<br/>O'Ben Brands Team</p>
      `;

      await this.mailService.sendUserConfirmation({
        email,
        subject,
        content,
      });

      this.logger.log(`Payment failure notification sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send payment failure notification`, {
        email,
        error: error.message,
      });
    }
  }

  private async checkIfEventProcessed(
    reference: string,
    eventType: string,
  ): Promise<boolean> {
    try {
      const existingEvent = await this.webhookEventRepository.findOne({
        where: {
          reference,
          eventType,
          status: 'processed',
        },
      });
      return !!existingEvent;
    } catch (error) {
      this.logger.warn('Failed to check if event was processed', {
        reference,
        eventType,
        error: error.message,
      });
      return false; // Assume not processed if check fails
    }
  }

  private async markEventAsProcessed(
    reference: string,
    eventType: string,
    payload: any,
  ): Promise<void> {
    try {
      await this.webhookEventRepository.create({
        reference,
        eventType,
        status: 'processed',
        processedAt: new Date(),
        payload,
      });
    } catch (error) {
      this.logger.error('Failed to mark event as processed', {
        reference,
        eventType,
        error: error.message,
      });
    }
  }
}
