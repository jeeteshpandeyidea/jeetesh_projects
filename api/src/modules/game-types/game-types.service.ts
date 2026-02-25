import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameType, GameTypeDocument } from './schemas/game-type.schema';
import { CreateGameTypeDto } from './dto/create-game-type.dto';
import { UpdateGameTypeDto } from './dto/update-game-type.dto';

@Injectable()
export class GameTypesService {
  constructor(
    @InjectModel(GameType.name)
    private readonly gameTypeModel: Model<GameTypeDocument>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'game-type';
  }

  create(dto: CreateGameTypeDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    const created = new this.gameTypeModel({
      name: dto.name,
      slug: slug,
      description: dto.description,
      status: dto.status ?? 'active',
    });
    return created.save();
  }

  findAll() {
    return this.gameTypeModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const gameType = await this.gameTypeModel.findById(id).exec();
    if (!gameType) {
      throw new NotFoundException('Game type not found');
    }
    return gameType;
  }

  async update(id: string, dto: UpdateGameTypeDto) {
    const existing = await this.gameTypeModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Game type not found');
    }

    const updateData: any = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

    if (dto.name !== undefined) {
      updateData.slug = this.generateSlug(dto.name);
    } else if (dto.slug !== undefined) {
      updateData.slug = dto.slug;
    }

    const updated = await this.gameTypeModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.gameTypeModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Game type not found');
    }
    return { deleted: true };
  }
}
