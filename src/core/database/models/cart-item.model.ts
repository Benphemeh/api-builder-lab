import { Column, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import Cart from './cart.model';
import Product from './product.model';
import { ApiBuilderTable } from '../base-model/table-decorators';
import { BaseModel } from '../base-model';

@ApiBuilderTable({
  tableName: 'cart_items',
})
export default class CartItem extends BaseModel {
  @ForeignKey(() => Cart)
  @Column({
    field: 'cart_id',
  })
  cartId: string;

  @BelongsTo(() => Cart)
  cart: Cart;

  @ForeignKey(() => Product)
  @Column({
    field: 'product_id',
  })
  productId: string;

  @BelongsTo(() => Product)
  product: Product;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  quantity: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    field: 'price_at_time',
  })
  priceAtTime: number;

  // Virtual field to calculate item total
  get itemTotal(): number {
    return this.priceAtTime * this.quantity;
  }
}
