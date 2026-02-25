import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WinningPattern, WinningPatternDocument } from './schemas/winning-pattern.schema';
import { CreateWinningPatternDto } from './dto/create-winning-pattern.dto';
import { UpdateWinningPatternDto } from './dto/update-winning-pattern.dto';

@Injectable()
export class WinningPatternService {
  constructor(
    @InjectModel(WinningPattern.name)
    private readonly model: Model<WinningPatternDocument>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'winning-pattern';
  }

  async create(dto: CreateWinningPatternDto) {
    const nameTrim = (dto.name ?? '').trim();
    if (!nameTrim) {
      throw new BadRequestException({ message: 'Name is required' });
    }
    const slug = (dto.slug && dto.slug.trim()) ? dto.slug.trim().toLowerCase() : this.generateSlug(nameTrim);

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
      name: nameTrim,
      slug,
      status: dto.status ?? 'active',
      pattern_type: dto.pattern_type ?? 'BASIC',
    });
    try {
      return await created.save();
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: number }).code : undefined;
      if (code === 11000) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: [{ field: 'slug', messages: ['Slug must be unique'] }],
        });
      }
      throw err;
    }
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Winning pattern not found');
    return doc;
  }

  async update(id: string, dto: UpdateWinningPatternDto) {
    const existing = await this.model.findById(id).exec();
    if (!existing) throw new NotFoundException('Winning pattern not found');
    const updateData: Record<string, unknown> = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.pattern_type !== undefined && { pattern_type: dto.pattern_type }),
    };
    if (dto.name !== undefined) updateData.slug = this.generateSlug(dto.name);
    else if (dto.slug !== undefined) updateData.slug = dto.slug;
    return this.model.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Winning pattern not found');
    return { deleted: true };
  }
}
