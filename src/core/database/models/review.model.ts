import { Column, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import User from './user.model';
import Product from './product.model';
import { ApiBuilderTable } from '../base-model/table-decorators';
import { BaseModel } from '../base-model';

@ApiBuilderTable({
  tableName: 'reviews',
})
export default class Review extends BaseModel {
  @ForeignKey(() => User)
  @Column({
    field: 'user_id', // Map to the actual database column name
  })
  userId: string;

  @ForeignKey(() => Product)
  @Column({
    field: 'product_id', // Map to the actual database column name
  })
  productId: string;

  @BelongsTo(() => Product)
  product: Product;

  @Column({ type: DataType.INTEGER, allowNull: false })
  rating: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  comment: string;
}
