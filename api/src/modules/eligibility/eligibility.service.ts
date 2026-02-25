import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Eligibility, EligibilityDocument } from './schemas/eligibility.schema';
import { CreateEligibilityDto } from './dto/create-eligibility.dto';
import { UpdateEligibilityDto } from './dto/update-eligibility.dto';

@Injectable()
export class EligibilityService {
  constructor(
    @InjectModel(Eligibility.name)
    private readonly eligibilityModel: Model<EligibilityDocument>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'eligibility';
  }

  create(dto: CreateEligibilityDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    const created = new this.eligibilityModel({
      name: dto.name,
      slug,
      status: dto.status ?? 'active',
    });
    return created.save();
  }

  findAll() {
    return this.eligibilityModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const item = await this.eligibilityModel.findById(id).exec();
    if (!item) throw new NotFoundException('Eligibility not found');
    return item;
  }

  async update(id: string, dto: UpdateEligibilityDto) {
    const existing = await this.eligibilityModel.findById(id).exec();
    if (!existing) throw new NotFoundException('Eligibility not found');

    const updateData: any = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

    if (dto.name !== undefined) updateData.slug = this.generateSlug(dto.name);
    else if (dto.slug !== undefined) updateData.slug = dto.slug;

    const updated = await this.eligibilityModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.eligibilityModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Eligibility not found');
    return { deleted: true };
  }
}
