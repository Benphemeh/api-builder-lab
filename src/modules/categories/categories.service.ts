import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REPOSITORY } from 'src/core/constants';
import Category from 'src/core/database/models/category.model';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(REPOSITORY.CATEGORY)
    private readonly categoryRepository: typeof Category,
  ) {}

  async createCategory(data: {
    name: string;
    description?: string;
  }): Promise<Category> {
    return this.categoryRepository.create(data);
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findByPk(id);
    if (!category) {
      throw new NotFoundException(`category with ID ${id} not found`);
    }
    return category;
  }

  async updateCategory(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<Category> {
    const category = await this.getCategoryById(id);
    await category.update(data);
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.getCategoryById(id);
    await category.destroy();
  }
}
