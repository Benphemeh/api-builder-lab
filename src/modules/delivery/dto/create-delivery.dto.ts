import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateDeliveryDto {
  @IsUUID('4', { message: 'Order ID must be a valid UUID' })
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsString()
  @IsNotEmpty()
  logisticsProvider: string;
}
