import { IsUUID, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class CartToOrderDto {
  @IsUUID()
  @IsOptional()
  cartId?: string;

  @IsOptional()
  deliveryAddress?: string;
}

export class RemoveFromCartDto {
  @IsUUID()
  productId: string;
}
