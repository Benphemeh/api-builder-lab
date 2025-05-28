import { Column, DataType } from 'sequelize-typescript';
import { BaseModel } from '../base-model';
import { ApiBuilderTable } from '../base-model/table-decorators';

@ApiBuilderTable({ tableName: 'coupons' })
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
