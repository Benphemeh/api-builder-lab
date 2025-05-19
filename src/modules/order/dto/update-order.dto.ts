import { IsOptional, IsEnum } from 'class-validator';
import { ORDER_STATUS } from 'src/core/enums';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(ORDER_STATUS, {
    message: 'Status must be one of: pending, completed, or canceled',
  })
  status?: ORDER_STATUS;
}
