import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtGuard } from '../guards/jwt-guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':productId')
  @UseGuards(JwtGuard)
  async addReview(
    @Req() req,
    @Param('productId') productId: string,
    @Body() body: { rating: number; comment?: string },
  ) {
    const userId = req.user.id;
    return this.reviewService.addReview(
      userId,
      productId,
      body.rating,
      body.comment,
    );
  }

  @Get(':productId')
  @UseGuards(JwtGuard)
  async getReviews(@Param('productId') productId: string) {
    return this.reviewService.getReviews(productId);
  }

  @Delete(':reviewId')
  @UseGuards(JwtGuard)
  async deleteReview(@Req() req, @Param('reviewId') reviewId: string) {
    const userId = req.user.id;
    return this.reviewService.deleteReview(userId, reviewId);
  }
}
