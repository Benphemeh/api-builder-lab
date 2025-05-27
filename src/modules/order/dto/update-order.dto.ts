import { IsOptional, IsEnum } from 'class-validator';
import { ORDER_STATUS } from 'src/core/enums';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(ORDER_STATUS)
  status?: ORDER_STATUS;
  deliveryAddress?: string;
}
