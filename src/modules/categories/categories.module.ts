import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { categoriesProviders } from './categories.provider';
import { DatabaseModule } from 'src/core/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [...categoriesProviders, CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
