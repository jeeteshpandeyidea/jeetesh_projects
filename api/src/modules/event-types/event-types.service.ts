import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventType, EventTypeDocument } from './schemas/event-type.schema';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

@Injectable()
export class EventTypesService {
  constructor(
    @InjectModel(EventType.name)
    private readonly eventTypeModel: Model<EventTypeDocument>,
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
      || 'event-type';
  }

  create(dto: CreateEventTypeDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    const created = new this.eventTypeModel({
      name: dto.name,
      slug: slug,
      description: dto.description,
      status: dto.status ?? 'active',
    });
    return created.save();
  }

  findAll() {
    return this.eventTypeModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const eventType = await this.eventTypeModel.findById(id).exec();
    if (!eventType) {
      throw new NotFoundException('Event type not found');
    }
    return eventType;
  }

  async update(id: string, dto: UpdateEventTypeDto) {
    const existing = await this.eventTypeModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Event type not found');
    }

    const updateData: any = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

    // Auto-generate slug if name is being updated, or use provided slug
    if (dto.name !== undefined) {
      updateData.slug = this.generateSlug(dto.name);
    } else if (dto.slug !== undefined) {
      updateData.slug = dto.slug;
    }

    const updated = await this.eventTypeModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.eventTypeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Event type not found');
    }
    return { deleted: true };
  }
}

