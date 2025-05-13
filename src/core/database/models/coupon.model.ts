import { Table, Column, DataType } from 'sequelize-typescript';
import { BaseModel } from '../base-model';

@Table({ tableName: 'coupons', timestamps: true })
export default class Coupon extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  code: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  discountPercentage: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  expiresAt: Date;
}
