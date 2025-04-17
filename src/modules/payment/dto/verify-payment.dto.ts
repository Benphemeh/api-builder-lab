import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @IsNotEmpty()
  @IsString({ message: 'reference must be a string' })
  reference: string;
}
