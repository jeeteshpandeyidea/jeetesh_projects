import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubCategory, SubCategorySchema } from './schemas/subcategory.schema';
import { SubCategoriesService } from './subcategories.service';
import { SubCategoriesController } from './subcategories.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
  ],
  providers: [SubCategoriesService],
  controllers: [SubCategoriesController],
  exports: [SubCategoriesService],
})
export class SubCategoriesModule {}

