import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateDeliveryStatusDto {
  @IsString({ message: 'Status must be a string' })
  @IsIn(['pending', 'in-transit', 'delivered'], {
    message: 'Status must be one of: pending, in-transit, or delivered',
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: 'pending' | 'in-transit' | 'delivered';
}
