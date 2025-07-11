import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @IsString({ message: 'Reference must be a string' })
  @IsNotEmpty({ message: 'Reference is required and cannot be empty' })
  reference: string;
}
