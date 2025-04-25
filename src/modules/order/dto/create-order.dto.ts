import {
  IsUUID,
  IsInt,
  Min,
  ValidateNested,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;
}
