import { Table, Column, DataType } from 'sequelize-typescript';
import { BaseModel } from '../base-model';

@Table({ tableName: 'coupons', timestamps: true })
export default class Coupon extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'code',
  })
  code: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: 'discount_percentage',
  })
  discountPercentage: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'expires_at',
  })
  expiresAt: Date;
}
