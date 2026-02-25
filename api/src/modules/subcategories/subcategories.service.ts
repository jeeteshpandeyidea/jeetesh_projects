import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { SubCategory, SubCategoryDocument } from './schemas/subcategory.schema';
import { CreateSubCategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategoryDocument>,
  ) {}

  async create(dto: CreateSubCategoryDto) {
    const slug = slugify(dto.name, {
      lower: true,
      strict: true,
    });

    const existing = await this.subCategoryModel.findOne({ slug });
      if (existing) {
        throw new ConflictException('Sub Category slug already exists');
      }

    const created = new this.subCategoryModel({
      name: dto.name,
      category_id: dto.category_id,
      description: dto.description,
      status: dto.status ?? 'active',
      slug
    });
    return created.save();
  }

  findAll() {
  return this.subCategoryModel
    .find()
    .populate('category_id', 'name')
    .sort({ _id: -1 })
    .exec();
}

  async findOne(id: string) {
    const category = await this.subCategoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, dto: UpdateSubCategoryDto) {
    const category = await this.subCategoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async remove(id: string) {
    const category = await this.subCategoryModel
      .findByIdAndDelete(id)
      .exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return { message: 'SubCategory deleted successfully', id };
  }
}
