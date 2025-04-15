import { IsEmail, IsNumber, IsString } from 'class-validator';

export class InitializePaymentDto {
  @IsEmail()
  email: string;

  @IsNumber()
  amount: number;

  @IsString()
  orderId: string;
}
