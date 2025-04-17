import { IsUUID, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId: string;

  @IsString()
  @IsNotEmpty({ message: 'Reference is required' })
  reference: string;

  @IsString()
  @IsNotEmpty({ message: 'Status is required' })
  status: 'pending' | 'success' | 'failed';

  @IsNumber()
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;
}
