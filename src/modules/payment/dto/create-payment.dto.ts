import { IsUUID, IsString, IsNumber } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsString()
  reference: string;

  @IsString()
  status: 'pending' | 'success' | 'failed';

  @IsNumber()
  amount: number;
}
