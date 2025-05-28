import { REPOSITORY } from 'src/core/constants';
import Wishlist from 'src/core/database/models/wishlist.model';

export const wishlistProviders = [
  {
    provide: REPOSITORY.WISHLIST,
    useValue: Wishlist,
  },
];
