import { Column, ForeignKey } from 'sequelize-typescript';
import User from './user.model';
import Product from './product.model';
import { BaseModel } from '../base-model';
import { ApiBuilderTable } from '../base-model/table-decorators';

@ApiBuilderTable({
  tableName: 'wishlists',
})
export default class Wishlist extends BaseModel {
  @ForeignKey(() => User)
  @Column
  userId: string;

  @ForeignKey(() => Product)
  @Column
  productId: string;
}
