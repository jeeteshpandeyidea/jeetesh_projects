import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward, RewardDocument } from './schemas/reward.schema';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name)
    private readonly model: Model<RewardDocument>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'reward';
  }

  create(dto: CreateRewardDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    const created = new this.model({
      name: dto.name,
      slug,
      value: dto.value,
      status: dto.status ?? 'active',
    });
    return created.save();
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Reward not found');
    return doc;
  }

  async update(id: string, dto: UpdateRewardDto) {
    const existing = await this.model.findById(id).exec();
    if (!existing) throw new NotFoundException('Reward not found');
    const updateData: Record<string, unknown> = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.value !== undefined && { value: dto.value }),
      ...(dto.status !== undefined && { status: dto.status }),
    };
    if (dto.name !== undefined) updateData.slug = this.generateSlug(dto.name);
    else if (dto.slug !== undefined) updateData.slug = dto.slug;
    return this.model.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Reward not found');
    return { deleted: true };
  }
}
