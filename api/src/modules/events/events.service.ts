import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
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
      || 'event';
  }

  create(dto: CreateEventDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    const created = new this.eventModel({
      name: dto.name,
      slug: slug,
      category_id: dto.category_id,
      event_type_id: dto.event_type_id,
      start_date: dto.start_date ? new Date(dto.start_date) : undefined,
      end_date: dto.end_date ? new Date(dto.end_date) : undefined,
      eligibility_id: dto.eligibility_id,
      winning_condition: dto.winning_condition,
      game_type_id: dto.game_type_id,
      max_participants: dto.max_participants ?? 0,
      reward_id: dto.reward_id,
      rewards_value: dto.rewards_value,
      distribution: dto.distribution,
      status: dto.status ?? 'active',
      description: dto.description,
    });
    return created.save();
  }

  findAll() {
    return this.eventModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    const existing = await this.eventModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    const updateData: Record<string, unknown> = {
      ...(dto.category_id !== undefined && { category_id: dto.category_id }),
      ...(dto.event_type_id !== undefined && { event_type_id: dto.event_type_id }),
      ...(dto.start_date !== undefined && { start_date: new Date(dto.start_date) }),
      ...(dto.end_date !== undefined && { end_date: new Date(dto.end_date) }),
      ...(dto.eligibility_id !== undefined && { eligibility_id: dto.eligibility_id }),
      ...(dto.winning_condition !== undefined && { winning_condition: dto.winning_condition }),
      ...(dto.game_type_id !== undefined && { game_type_id: dto.game_type_id }),
      ...(dto.max_participants !== undefined && { max_participants: dto.max_participants }),
      ...(dto.reward_id !== undefined && { reward_id: dto.reward_id }),
      ...(dto.rewards_value !== undefined && { rewards_value: dto.rewards_value }),
      ...(dto.distribution !== undefined && { distribution: dto.distribution }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.description !== undefined && { description: dto.description }),
    };

    // Auto-generate slug if name is being updated, or use provided slug
    if (dto.name !== undefined) {
      updateData.name = dto.name;
      updateData.slug = this.generateSlug(dto.name);
    } else if (dto.slug !== undefined) {
      updateData.slug = dto.slug;
    }

    const updated = await this.eventModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.eventModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Event not found');
    }
    return { deleted: true };
  }
}
