import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async createCategory(@Body() data: { name: string; description?: string }) {
    return this.categoriesService.createCategory(data);
  }

  @Get()
  async getAllCategories() {
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(id);
  }

  @Patch(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string },
  ) {
    return this.categoriesService.updateCategory(id, data);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    await this.categoriesService.deleteCategory(id);
    return {
      message: `Category with ID ${id} deleted successfully`,
    };
  }
}
