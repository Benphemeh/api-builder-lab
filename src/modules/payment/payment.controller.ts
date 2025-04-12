// // src/modules/payments/payment.controller.ts
// import {
//   Controller,
//   Post,
//   Body,
//   UseGuards,
//   Req,
//   HttpCode,
//   Headers,
//   BadRequestException,
// } from '@nestjs/common';
// import { PaymentService } from './payment.service';
// import { JwtGuard } from 'src/modules/guards/jwt-guard';
// import { InitializePaymentDto } from './dto/initialize-payment.dto';
// import { VerifyPaymentDto } from './dto/verify-payment.dto';
// import { ConfigService } from '@nestjs/config';

// @Controller('payments')
// export class PaymentController {
//   constructor(
//     private readonly paymentService: PaymentService,
//     private readonly configService: ConfigService,
//   ) {}

//   @UseGuards(JwtGuard)
//   @Post('initialize')
//   async initializePayment(@Body() dto: InitializePaymentDto, @Req() req: any) {
//     return this.paymentService.initializePayment(req.user.id, dto);
//   }

//   @UseGuards(JwtGuard)
//   @Post('verify')
//   async verifyPayment(@Body() dto: VerifyPaymentDto) {
//     return this.paymentService.verifyPayment(dto);
//   }

//   @Post('webhook')
//   @HttpCode(200)
//   async webhook(
//     @Body() body: any,
//     @Headers('x-paystack-signature') signature: string,
//   ) {
//     // Verify signature
//     if (!signature) {
//       throw new BadRequestException('Missing Paystack signature');
//     }

//     const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');

//     // In a production environment, verify the signature
//     // const hash = crypto
//     //   .createHmac('sha512', secret)
//     //   .update(JSON.stringify(body))
//     //   .digest('hex');

//     // if (hash !== signature) {
//     //   throw new BadRequestException('Invalid signature');
//     // }

//     return this.paymentService.handleWebhook(body);
//   }
// }
