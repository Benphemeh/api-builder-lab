import { REPOSITORY } from 'src/core/constants';
import Cart from 'src/core/database/models/cart.model';
import CartItem from 'src/core/database/models/cart-item.model';
import { Product } from 'src/core/database';

export const cartProviders = [
  {
    provide: REPOSITORY.CART,
    useValue: Cart,
  },
  {
    provide: REPOSITORY.CART_ITEM,
    useValue: CartItem,
  },
  {
    provide: REPOSITORY.PRODUCT,
    useValue: Product,
  },
];
