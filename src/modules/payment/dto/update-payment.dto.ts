import { IsEnum, IsNotEmpty } from 'class-validator';
import { PAYMENT_STATUS } from 'src/core/enums';

export class UpdatePaymentDto {
  @IsEnum(PAYMENT_STATUS, {
    message: `Status must be one of: ${Object.values(PAYMENT_STATUS).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: PAYMENT_STATUS;
}
