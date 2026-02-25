import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PropertyType, PropertyTypeDocument } from './schemas/property-type.schema';
import { CreatePropertyTypeDto } from './dto/create-property-type.dto';
import { UpdatePropertyTypeDto } from './dto/update-property-type.dto';

@Injectable()
export class PropertyTypesService {
  constructor(
    @InjectModel(PropertyType.name)
    private readonly propertyTypeModel: Model<PropertyTypeDocument>,
  ) {}

  private generateSlug(name: string): string {
    // Generate slug from name by converting to lowercase slug format
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-') // spaces/underscores -> dash
      .replace(/[^a-z0-9-]/g, '') // remove non-url chars
      .replace(/-+/g, '-') // collapse multiple dashes
      .replace(/^-+|-+$/g, '') // remove leading/trailing dashes
      || 'property-type';
  }

  create(dto: CreatePropertyTypeDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    const created = new this.propertyTypeModel({
      name: dto.name,
      slug,
      description: dto.description,
      status: dto.status ?? 'active',
    });
    return created.save();
  }

  findAll() {
    return this.propertyTypeModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const propertyType = await this.propertyTypeModel.findById(id).exec();
    if (!propertyType) {
      throw new NotFoundException('Property type not found');
    }
    return propertyType;
  }

  async update(id: string, dto: UpdatePropertyTypeDto) {
    const existing = await this.propertyTypeModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Property type not found');
    }

    const updateData: any = {
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

    // Auto-generate slug if name is being updated, or use provided slug
    if (dto.name !== undefined) {
      updateData.name = dto.name;
      updateData.slug = this.generateSlug(dto.name);
    } else if (dto.slug !== undefined) {
      updateData.slug = dto.slug;
    }

    const updated = await this.propertyTypeModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.propertyTypeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Property type not found');
    }
    return { deleted: true };
  }
}

