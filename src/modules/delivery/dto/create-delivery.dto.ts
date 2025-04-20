import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateDeliveryDto {
  @IsUUID('4', { message: 'Order ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Order ID is required' })
  orderId: string;

  @IsString({ message: 'Delivery address must be a string' })
  @IsNotEmpty({ message: 'Delivery address is required' })
  deliveryAddress: string;

  @IsString({ message: 'Logistics provider must be a string' })
  @IsNotEmpty({ message: 'Logistics provider is required' })
  logisticsProvider: string;
}
