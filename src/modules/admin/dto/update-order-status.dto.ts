import { IsEnum } from 'class-validator';
import { ORDER_STATUS } from 'src/core/enums';

export class UpdateOrderStatusDto {
  @IsEnum(ORDER_STATUS)
  status: ORDER_STATUS;
}
