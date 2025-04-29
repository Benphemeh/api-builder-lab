import {
  IsUUID,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsEnum,
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

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
