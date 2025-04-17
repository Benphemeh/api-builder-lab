import { IsOptional, IsString } from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  status?: 'pending' | 'success' | 'failed';
}
