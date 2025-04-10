import { IsOptional, IsEnum } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(['pending', 'completed', 'canceled'], {
    message: 'Status must be one of: pending, completed, or canceled',
  })
  status?: 'pending' | 'completed' | 'canceled';
}
