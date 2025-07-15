import {
  Controller,
  Post,
  Headers,
  Req,
  HttpStatus,
  HttpException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { PaystackWebhookDto } from './dto/webhook.dto';

@Controller('payments')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private webhookService: WebhookService) {}

  @Post('webhook')
  async handlePaystackWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: any,
  ) {
    const startTime = Date.now();

    try {
      // 1. Validate signature header
      if (!signature) {
        throw new BadRequestException('Missing Paystack signature');
      }

      // 2. Get raw body (should be Buffer from bodyParser.raw)
      if (!req.body || !(req.body instanceof Buffer)) {
        throw new BadRequestException('Invalid request body format');
      }

      const rawBody = req.body.toString('utf8');

      // 3. Verify signature
      const isValidSignature = this.webhookService.verifyPaystackSignature(
        rawBody,
        signature,
      );

      if (!isValidSignature) {
        throw new BadRequestException('Invalid webhook signature');
      }

      // 4. Parse JSON payload
      let webhookData: PaystackWebhookDto;
      try {
        webhookData = JSON.parse(rawBody);
      } catch (error) {
        this.logger.error('Failed to parse webhook JSON:', error.message);
        throw new BadRequestException('Invalid JSON payload');
      }

      // 5. Process the webhook event
      await this.webhookService.processWebhookEvent(webhookData);

      const processingTime = Date.now() - startTime;

      this.logger.log(`✅ Webhook processed successfully`, {
        event: webhookData.event,
        reference: webhookData.data.reference,
        processingTime: `${processingTime}ms`,
      });

      // 6. Return success response (IMPORTANT: Paystack needs 200 status)
      return {
        status: 'success',
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      this.logger.error('❌ Webhook processing failed', {
        error: error.message,
        processingTime: `${processingTime}ms`,
        signature: signature?.substring(0, 20) + '...',
      });

      // Don't expose internal errors to external services
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException(
        'Webhook processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
