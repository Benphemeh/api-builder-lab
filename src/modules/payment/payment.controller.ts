import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtGuard } from 'src/modules/guards/jwt-guard';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ConfigService } from '@nestjs/config';

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
    );
    const orderId = dto.orderId || null;

    await this.paymentService.createPayment({
      orderId,
      reference: paymentResponse.data.reference,
      status: 'pending',
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
    @Req() req: any, // Add @Req() to access the raw body
  ) {
    // Log the incoming headers and body for debugging
    console.log('Incoming Webhook Request:');
    console.log('Headers:', req.headers);
    console.log('Raw Body:', req.body.toString());

    if (!signature) {
      console.error('Missing Paystack signature');
      throw new BadRequestException('Missing Paystack signature');
    }

    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    // Verify the webhook signature
    const crypto = await import('crypto');
    const hash = crypto
      .createHmac('sha512', secret)
      .update(req.body) // Use the raw body for signature verification
      .digest('hex');

    console.log('Calculated Hash:', hash);
    console.log('Paystack Signature:', signature);

    if (hash !== signature) {
      console.error('Invalid Paystack signature');
      throw new BadRequestException('Invalid Paystack signature');
    }

    console.log('Webhook signature verified successfully');

    // Process the webhook event
    await this.paymentService.handleWebhook(body);
    console.log('Webhook event processed successfully');
  }
  // @Post('webhook')
  // @HttpCode(200)
  // async webhook(
  //   @Body() body: any,
  //   @Headers('x-paystack-signature') signature: string,
  // ) {
  //   if (!signature) {
  //     throw new BadRequestException('Missing Paystack signature');
  //   }

  //   const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

  //   // Verify the webhook signature
  //   const crypto = await import('crypto');
  //   const hash = crypto
  //     .createHmac('sha512', secret)
  //     .update(JSON.stringify(body))
  //     .digest('hex');

  //   if (hash !== signature) {
  //     throw new BadRequestException('Invalid Paystack signature');
  //   }

  //   await this.paymentService.handleWebhook(body);
  // }
}
