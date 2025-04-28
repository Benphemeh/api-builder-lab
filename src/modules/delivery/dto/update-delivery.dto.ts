import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateDeliveryStatusDto {
  @IsString({ message: 'status must be a string' })
  @IsIn(['pending', 'in-transit', 'delivered'], {
    message: 'status must be one of: pending, in-transit, or delivered',
  })
  @IsNotEmpty({ message: 'status is required' })
  status: 'pending' | 'in-transit' | 'delivered';
}
