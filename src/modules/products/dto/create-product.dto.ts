import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  stock: number;

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  size: string;

  @IsOptional()
  @IsString()
  breed: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
