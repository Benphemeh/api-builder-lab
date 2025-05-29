import { REPOSITORY } from 'src/core/constants';
import Cart from 'src/core/database/models/cart.model';
import CartItem from 'src/core/database/models/cart-item.model';

export const cartProviders = [
  {
    provide: REPOSITORY.CART,
    useValue: Cart,
  },
  {
    provide: REPOSITORY.CART_ITEM,
    useValue: CartItem,
  },
];
