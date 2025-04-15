import { IsEmail, IsNumber, IsString } from 'class-validator';

export class InitializePaymentDto {
  @IsEmail()
  email: string;

  @IsNumber()
  amount: number;

  @IsString()
  orderId: string;
}
// src/modules/payments/dto/initialize-payment.dto.ts
// import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

// export class InitializePaymentDto {
//   @IsNotEmpty()
//   @IsString()
//   orderId: string;

//   @IsOptional()
//   @IsString()
//   callbackUrl?: string;
// }
