import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { DatabaseModule } from 'src/core/database/database.module';
import { JwtService } from '@nestjs/jwt';
import { reviewProviders } from './review.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [ReviewController],
  providers: [ReviewService, JwtService, ...reviewProviders],
})
export class ReviewModule {}
