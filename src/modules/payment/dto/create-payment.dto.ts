import { IsUUID, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  status: 'pending' | 'success' | 'failed';

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
