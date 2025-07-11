import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';

export class InitializePaymentDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @IsNotEmpty({ message: 'Amount is required' })
  @Min(1, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsOptional()
  @IsString({ message: 'Order ID must be a string' })
  orderId?: string;
}
