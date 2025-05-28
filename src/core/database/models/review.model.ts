import { Column, ForeignKey, DataType } from 'sequelize-typescript';
import User from './user.model';
import Product from './product.model';
import { ApiBuilderTable } from '../base-model/table-decorators';
import { BaseModel } from '../base-model';

@ApiBuilderTable({
  tableName: 'reviews',
})
export default class Review extends BaseModel {
  @ForeignKey(() => User)
  @Column
  userId: string;

  @ForeignKey(() => Product)
  @Column
  productId: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  rating: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  comment: string;
}
