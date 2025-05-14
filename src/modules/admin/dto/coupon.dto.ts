import {
  IsString,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(0)
  discountPercentage: number;

  @IsDateString()
  expiresAt: string;
}
