import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/core/database/database.module';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { wishlistProviders } from './wishlist.provider';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule],
  controllers: [WishlistController],
  providers: [WishlistService, JwtService, ...wishlistProviders],
  exports: [WishlistService],
})
export class WishlistModule {}
