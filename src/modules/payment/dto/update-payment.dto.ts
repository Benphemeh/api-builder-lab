import { IsOptional, IsEnum } from 'class-validator';
import { PAYMENT_STATUS } from 'src/core/enums';

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PAYMENT_STATUS)
  status?: PAYMENT_STATUS;
}
