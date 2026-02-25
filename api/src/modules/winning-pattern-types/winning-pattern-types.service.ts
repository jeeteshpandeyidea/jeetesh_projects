import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WinningPatternType, WinningPatternTypeDocument } from './schemas/winning-pattern-type.schema';
import { CreateWinningPatternTypeDto } from './dto/create-winning-pattern-type.dto';
import { UpdateWinningPatternTypeDto } from './dto/update-winning-pattern-type.dto';

@Injectable()
export class WinningPatternTypesService {
  constructor(
    @InjectModel(WinningPatternType.name)
    private readonly model: Model<WinningPatternTypeDocument>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'winning-pattern-type';
  }

  async create(dto: CreateWinningPatternTypeDto) {
    const nameTrim = dto.name.trim();
    const slug = this.generateSlug(nameTrim);

    const existingName = await this.model.findOne({ name: nameTrim }).exec();
    if (existingName) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: [{ field: 'name', messages: ['Name must be unique'] }],
      });
    }
    const existingSlug = await this.model.findOne({ slug }).exec();
    if (existingSlug) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: [{ field: 'slug', messages: ['Slug must be unique'] }],
      });
    }

    const created = new this.model({
      winning_pattern_id: new Types.ObjectId(dto.winning_pattern_id),
      name: nameTrim,
      slug,
      description: dto.description ?? '',
      status: dto.status ?? 'active',
    });
    return created.save();
  }

  findAll() {
    return this.model.find().populate('winning_pattern_id').sort({ createdAt: -1 }).exec();
  }

  /** Find all types for a given winning pattern (for dynamic game UI). */
  findByWinningPatternId(winningPatternId: string) {
    if (!winningPatternId?.trim()) return this.findAll();
    return this.model
      .find({ winning_pattern_id: new Types.ObjectId(winningPatternId.trim()) })
      .populate('winning_pattern_id')
      .sort({ createdAt: 1 })
      .exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).populate('winning_pattern_id').exec();
    if (!doc) throw new NotFoundException('Winning pattern type not found');
    return doc;
  }

  async update(id: string, dto: UpdateWinningPatternTypeDto) {
    const existing = await this.model.findById(id).exec();
    if (!existing) throw new NotFoundException('Winning pattern type not found');

    const updateData: Record<string, unknown> = {};
    if (dto.winning_pattern_id !== undefined) updateData.winning_pattern_id = new Types.ObjectId(dto.winning_pattern_id);
    if (dto.name !== undefined) {
      const nameTrim = dto.name.trim();
      const existingName = await this.model.findOne({ name: nameTrim, _id: { $ne: id } }).exec();
      if (existingName) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: [{ field: 'name', messages: ['Name must be unique'] }],
        });
      }
      const newSlug = this.generateSlug(dto.name);
      const existingSlug = await this.model.findOne({ slug: newSlug, _id: { $ne: id } }).exec();
      if (existingSlug) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: [{ field: 'slug', messages: ['Slug must be unique'] }],
        });
      }
      updateData.name = nameTrim;
      updateData.slug = newSlug;
    } else if (dto.slug !== undefined) {
      const slug = dto.slug.trim().toLowerCase();
      const existingSlug = await this.model.findOne({ slug, _id: { $ne: id } }).exec();
      if (existingSlug) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: [{ field: 'slug', messages: ['Slug must be unique'] }],
        });
      }
      updateData.slug = slug;
    }
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status !== undefined) updateData.status = dto.status;

    return this.model.findByIdAndUpdate(id, { $set: updateData }, { new: true }).populate('winning_pattern_id').exec();
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Winning pattern type not found');
    return { deleted: true };
  }
}
