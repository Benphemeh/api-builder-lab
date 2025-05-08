import { IsEnum } from 'class-validator';
import { ORDER_STATUS } from 'src/core/enums';

export class UpdateOrderStatusDto {
  @IsEnum(ORDER_STATUS, { message: 'Invalid order status' })
  status: ORDER_STATUS;
}
