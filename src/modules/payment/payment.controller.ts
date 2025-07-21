import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtGuard } from 'src/modules/guards/jwt-guard';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PAYMENT_STATUS } from 'src/core/enums';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtGuard)
  @Post('initialize')
  async initializePayment(@Body() dto: InitializePaymentDto) {
    const paymentResponse = await this.paymentService.initializePayment(
      dto.email,
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
