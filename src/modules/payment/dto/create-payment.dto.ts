import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
} from 'class-validator';
import { PAYMENT_STATUS } from 'src/core/enums';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsOptional()
  @IsEnum(PAYMENT_STATUS)
  status?: PAYMENT_STATUS;

  // @IsNumber()
  @IsInt()
  @IsNotEmpty()
  amount: number;
}
