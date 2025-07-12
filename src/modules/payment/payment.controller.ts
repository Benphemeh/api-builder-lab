import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  Headers,
  BadRequestException,
  Patch,
  Param,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtGuard } from 'src/modules/guards/jwt-guard';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ConfigService } from '@nestjs/config';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PAYMENT_STATUS } from 'src/core/enums';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtGuard)
  @Post('initialize')
  async initializePayment(@Body() dto: InitializePaymentDto, @Req() req: any) {
    const userId = req.user.id;

    const email = dto.email;

    const paymentResponse = await this.paymentService.initializePayment(
      email,
      dto.amount,
      dto.orderId,
    );
    const orderId = dto.orderId || null;

    await this.paymentService.createPayment({
      orderId,
      reference: paymentResponse.data.reference,
      status: PAYMENT_STATUS.PENDING,
      amount: dto.amount,
    });

    return {
      message: 'Payment initialized successfully',
      payment: paymentResponse.data,
    };
  }

  @UseGuards(JwtGuard)
  @Post('verify')
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentService.verifyPayment(dto.reference);
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
    @Req() req: any,
  ) {
    console.log('Incoming Webhook Request:');

    if (!signature) {
      console.error('Missing Paystack signature');
      throw new BadRequestException('Missing Paystack signature');
    }

    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    let rawBodyString: string;
    let parsedBody: any = body;

    // Check if body is already parsed (test environment) or raw string (production)
    if (typeof req.body === 'string') {
      // Production environment - body is raw string
      rawBodyString = req.body;
      try {
        parsedBody = JSON.parse(rawBodyString);
      } catch (error) {
        console.error('Failed to parse webhook body JSON:', error);
        throw new BadRequestException('Invalid JSON in webhook body');
      }
    } else if (typeof req.body === 'object' && req.body !== null) {
      // Test environment - body is already parsed JSON object
      rawBodyString = JSON.stringify(req.body);
      parsedBody = req.body;
    } else {
      // Handle edge cases
      rawBodyString = '';
      parsedBody = {};
    }

    // Verify the webhook signature
    const crypto = await import('crypto');
    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBodyString)
      .digest('hex');

    console.log('Calculated Hash:', hash);
    console.log('Paystack Signature:', signature);

    if (hash !== signature) {
      console.error('Invalid Paystack signature');
      throw new BadRequestException('Invalid Paystack signature');
    }

    console.log('Webhook signature verified successfully');

    await this.paymentService.handleWebhook(parsedBody);
    console.log('Webhook event processed successfully');
  }

  @UseGuards(JwtGuard)
  @Patch(':reference')
  async updatePaymentStatus(
    @Param('reference') reference: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    const updatedStatus = await this.paymentService.updatePayment(
      reference,
      dto.status,
    );
    return updatedStatus;
  }
}
