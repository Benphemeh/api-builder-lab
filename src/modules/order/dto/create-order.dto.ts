import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  products: { productId: string; quantity: number }[];
}
