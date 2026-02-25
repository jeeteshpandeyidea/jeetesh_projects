import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GridSize, GridSizeDocument } from './schemas/grid-size.schema';
import { CreateGridSizeDto } from './dto/create-grid-size.dto';
import { UpdateGridSizeDto } from './dto/update-grid-size.dto';

@Injectable()
export class GridSizesService {
  constructor(
    @InjectModel(GridSize.name)
    private readonly gridSizeModel: Model<GridSizeDocument>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'grid-size';
  }

  create(dto: CreateGridSizeDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    const created = new this.gridSizeModel({
      name: dto.name,
      slug,
      status: dto.status ?? 'active',
    });
    return created.save();
  }

  findAll() {
    return this.gridSizeModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const item = await this.gridSizeModel.findById(id).exec();
    if (!item) throw new NotFoundException('Grid size not found');
    return item;
  }

  async update(id: string, dto: UpdateGridSizeDto) {
    const existing = await this.gridSizeModel.findById(id).exec();
    if (!existing) throw new NotFoundException('Grid size not found');

    const updateData: any = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

    if (dto.name !== undefined) {
      updateData.slug = this.generateSlug(dto.name);
    } else if (dto.slug !== undefined) {
      updateData.slug = dto.slug;
    }

    const updated = await this.gridSizeModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.gridSizeModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Grid size not found');
    return { deleted: true };
  }
}
