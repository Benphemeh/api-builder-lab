import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { DELIVERY_STATUS } from 'src/core/enums';

export class UpdateDeliveryStatusDto {
  @IsString()
  @IsIn(['pending', 'in-transit', 'delivered'], {
    message: 'status must be one of: pending, in-transit, or delivered',
  })
  @IsNotEmpty({ message: 'status is required' })
  status: DELIVERY_STATUS;
}
