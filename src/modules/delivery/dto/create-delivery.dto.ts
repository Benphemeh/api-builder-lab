import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateDeliveryDto {
  @IsUUID('4', { message: 'Order ID must be a valid UUID' })
  @IsNotEmpty()
  orderId: string;

  @IsString({ message: 'Delivery address must be a string' })
  @IsNotEmpty()
  deliveryAddress: string;

  @IsString({ message: 'Logistics provider must be a string' })
  @IsNotEmpty()
  logisticsProvider: string;
}
