import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomType, RoomTypeDocument } from './schemas/room-type.schema';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

@Injectable()
export class RoomTypesService {
  constructor(
    @InjectModel(RoomType.name)
    private readonly roomTypeModel: Model<RoomTypeDocument>,
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
      || 'room-type';
  }

  create(dto: CreateRoomTypeDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    const created = new this.roomTypeModel({
      name: dto.name,
      slug,
      description: dto.description,
      status: dto.status ?? 'active',
    });
    return created.save();
  }

  findAll() {
    return this.roomTypeModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const roomType = await this.roomTypeModel.findById(id).exec();
    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }
    return roomType;
  }

  async update(id: string, dto: UpdateRoomTypeDto) {
    const existing = await this.roomTypeModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Room type not found');
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

    const updated = await this.roomTypeModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.roomTypeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Room type not found');
    }
    return { deleted: true };
  }
}

