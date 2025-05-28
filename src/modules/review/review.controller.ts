import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':productId')
  async addReview(
    @Req() req,
    @Param('productId') productId: string,
    @Body() body: { rating: number; comment?: string },
  ) {
    const userId = req.user.id; // Assuming user is authenticated
    return this.reviewService.addReview(
      userId,
      productId,
      body.rating,
      body.comment,
    );
  }

  @Get(':productId')
  async getReviews(@Param('productId') productId: string) {
    return this.reviewService.getReviews(productId);
  }

  @Delete(':reviewId')
  async deleteReview(@Req() req, @Param('reviewId') reviewId: string) {
    const userId = req.user.id; // Assuming user is authenticated
    return this.reviewService.deleteReview(userId, reviewId);
  }
}
