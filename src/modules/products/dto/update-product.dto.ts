import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  stock: number;
}
