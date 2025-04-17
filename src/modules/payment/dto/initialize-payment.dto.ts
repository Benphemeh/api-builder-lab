import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class InitializePaymentDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId: string;
}
