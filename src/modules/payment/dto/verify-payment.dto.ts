// src/modules/payments/dto/verify-payment.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @IsNotEmpty()
  @IsString()
  reference: string;
}
