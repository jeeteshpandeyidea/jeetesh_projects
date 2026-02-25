import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { SubCategory, SubCategorySchema } from '../subcategories/schemas/subcategory.schema';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [MongooseModule, CategoriesService],
})
export class CategoriesModule {}

