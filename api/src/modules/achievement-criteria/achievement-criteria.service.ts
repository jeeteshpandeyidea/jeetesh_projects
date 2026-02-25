import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AchievementCriteria, AchievementCriteriaDocument } from './schemas/achievement-criteria.schema';
import { CreateAchievementCriteriaDto } from './dto/create-achievement-criteria.dto';
import { UpdateAchievementCriteriaDto } from './dto/update-achievement-criteria.dto';

@Injectable()
export class AchievementCriteriaService {
  constructor(
    @InjectModel(AchievementCriteria.name)
    private readonly model: Model<AchievementCriteriaDocument>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'achievement-criteria';
  }

  async create(dto: CreateAchievementCriteriaDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    const created = new this.model({ name: dto.name, slug, status: dto.status ?? 'active' });
    try {
      return await created.save();
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? (err as { code: number }).code : undefined;
      if (code === 11000) {
        throw new ConflictException('An achievement criteria with this name or slug already exists.');
      }
      throw err;
    }
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Achievement criteria not found');
    return doc;
  }

  async update(id: string, dto: UpdateAchievementCriteriaDto) {
    const existing = await this.model.findById(id).exec();
    if (!existing) throw new NotFoundException('Achievement criteria not found');
    const updateData: Record<string, unknown> = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.status !== undefined && { status: dto.status }),
    };
    if (dto.name !== undefined) updateData.slug = this.generateSlug(dto.name);
    else if (dto.slug !== undefined) updateData.slug = dto.slug;
    return this.model.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Achievement criteria not found');
    return { deleted: true };
  }
}
