import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Facility, FacilityDocument } from './schemas/facility.schema';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectModel(Facility.name)
    private readonly facilityModel: Model<FacilityDocument>,
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
      || 'facility';
  }

  create(dto: CreateFacilityDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    const created = new this.facilityModel({
      name: dto.name,
      slug,
      description: dto.description,
      status: dto.status ?? 'active',
    });
    return created.save();
  }

  findAll() {
    return this.facilityModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const facility = await this.facilityModel.findById(id).exec();
    if (!facility) {
      throw new NotFoundException('Facility not found');
    }
    return facility;
  }

  async update(id: string, dto: UpdateFacilityDto) {
    const existing = await this.facilityModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Facility not found');
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

    const updated = await this.facilityModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.facilityModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Facility not found');
    }
    return { deleted: true };
  }
}

