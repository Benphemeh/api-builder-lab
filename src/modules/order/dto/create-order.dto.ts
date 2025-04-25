import { IsUUID, IsInt, Min, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ProductDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  deliveryAddress: string;
}

export class CreateOrderDto {
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];
}
