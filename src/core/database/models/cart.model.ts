import {
  Column,
  ForeignKey,
  DataType,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import User from './user.model';
import CartItem from './cart-item.model';
import { ApiBuilderTable } from '../base-model/table-decorators';
import { BaseModel } from '../base-model';

@ApiBuilderTable({
  tableName: 'carts',
})
export default class Cart extends BaseModel {
  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.ENUM('active', 'abandoned', 'converted'),
    allowNull: false,
    defaultValue: 'active',
  })
  status: 'active' | 'abandoned' | 'converted';

  @HasMany(() => CartItem)
  cartItems: CartItem[];

  // Virtual field to calculate total
  get totalAmount(): number {
    if (!this.cartItems) return 0;
    return this.cartItems.reduce((total, item) => {
      return total + item.priceAtTime * item.quantity;
    }, 0);
  }

  get totalItems(): number {
    if (!this.cartItems) return 0;
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }
}
