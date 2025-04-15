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
    // Initialize payment
    const paymentResponse = await this.paymentService.initializePayment(
      email,
      dto.amount,
    );
    const orderId = dto.orderId || null;

    // Save the payment details in the database
    await this.paymentService.createPayment({
      orderId,
      reference: paymentResponse.data.reference,
      status: 'pending',
      amount: dto.amount,
    });

    return {
      message: 'Payment initialized successfully',
      payment: paymentResponse.data, // Includes authorization_url, reference, etc.
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
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Paystack signature');
    }

    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    // Verify the webhook signature (uncomment in production)
    // const hash = crypto
    //   .createHmac('sha512', secret)
    //   .update(JSON.stringify(body))
    //   .digest('hex');

    // if (hash !== signature) {
    //   throw new BadRequestException('Invalid signature');
    // }

    return this.paymentService.handleWebhook(body);
  }
}
