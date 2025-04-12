// src/modules/payments/dto/initialize-payment.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class InitializePaymentDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  callbackUrl?: string;
}
