import { Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Order from './order.model';
import { BaseModel } from '../base-model';
import { PAYMENT_STATUS } from 'src/core/enums';
import { ApiBuilderTable } from '../base-model/table-decorators';

@ApiBuilderTable({
  tableName: 'payments',
})
export default class Payment extends BaseModel {
  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'order_id',
  })
  orderId: string;

  @BelongsTo(() => Order)
  order: Order;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  reference: string;

  @Column({
    type: DataType.ENUM(...Object.values(PAYMENT_STATUS)),
    allowNull: false,
  })
  status: PAYMENT_STATUS;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount: number;
}
