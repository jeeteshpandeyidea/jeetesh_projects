import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Menu, MenuDocument } from './schemas/menu.schema';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu.name)
    private readonly menuModel: Model<MenuDocument>,
  ) {}

  create(dto: CreateMenuDto) {
    const created = new this.menuModel({
      name: dto.name,
      status: dto.status ?? 'active',
    });
    return created.save();
  }

  findAll() {
    return this.menuModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const menu = await this.menuModel.findById(id).exec();
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return menu;
  }

  async update(id: string, dto: UpdateMenuDto) {
    const updated = await this.menuModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.status !== undefined && { status: dto.status }),
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Menu not found');
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.menuModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Menu not found');
    }
    return { deleted: true };
  }
}


