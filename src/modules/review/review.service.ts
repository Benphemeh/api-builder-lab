import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY } from 'src/core/constants';
import { Product } from 'src/core/database';
import Review from 'src/core/database/models/review.model';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(REPOSITORY.REVIEW)
    private readonly reviewRepository: typeof Review,
    @Inject(REPOSITORY.PRODUCT)
    private readonly productRepository: typeof Product,
  ) {}

  async addReview(
    userId: string,
    productId: string,
    rating: number,
    comment?: string,
  ): Promise<Review> {
    const product = await this.productRepository.findByPk(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.reviewRepository.create({
      userId,
      productId,
      rating,
      comment,
    });
  }

  async getReviews(productId: string): Promise<Review[]> {
    return this.reviewRepository.findAll({ where: { productId } });
  }

  async deleteReview(userId: string, reviewId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, userId },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    await review.destroy();
  }
}
