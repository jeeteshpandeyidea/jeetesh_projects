import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import slugify from 'slugify';
import { Category, CategoryDocument } from './schemas/category.schema';
import { SubCategory, SubCategoryDocument } from '../subcategories/schemas/subcategory.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name, {
        lower: true,
        strict: true,
    });
        const existing = await this.categoryModel.findOne({ slug });
        if (existing) {
            throw new ConflictException('Category slug already exists');
        }
        const category = new this.categoryModel({
            name: dto.name,
            description: dto.description,
            status: dto.status ?? 'active',
            visibility_type: dto.visibility_type ?? 'FREE',
            slug,
        });
        return category.save();
    }

  findAll() {
    return this.categoryModel.find().sort({ _id: -1 }) .exec();
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async remove(id: string) {
    const trimmed = id?.trim();
    if (!trimmed) throw new BadRequestException('Category ID is required');
    if (!Types.ObjectId.isValid(trimmed)) throw new BadRequestException('Invalid category ID');
    const category = await this.categoryModel
      .findByIdAndDelete(trimmed)
      .exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return { message: 'Category deleted successfully', id: trimmed };
  }
  async findActive() {
    return this.categoryModel
        .find({ status: 'active' })
        .sort({ _id: -1 }) 
        .lean();
  }

  async getSubCategoryAccdCat(category_id: string) {
    return this.subCategoryModel
      .find({ category_id })
      .sort({ _id: -1 })
      .lean()
      .exec();
  }
}
