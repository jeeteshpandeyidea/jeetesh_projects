import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenuRoute, MenuRouteDocument } from './schemas/menu-route.schema';
import { CreateMenuRouteDto } from './dto/create-menu-route.dto';
import { UpdateMenuRouteDto } from './dto/update-menu-route.dto';

@Injectable()
export class MenuRouteService {
  constructor(
    @InjectModel(MenuRoute.name)
    private readonly menuRouteModel: Model<MenuRouteDocument>,
  ) {}

  private generateKey(name: string): string {
    // Generate key from name by converting to lowercase slug format
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s\_]+/g, '-') // spaces/underscores -> dash
      .replace(/[^a-z0-9\-]/g, '') // remove non-url chars
      .replace(/\-+/g, '-') // collapse multiple dashes
      || 'route';
  }

  async create(dto: CreateMenuRouteDto) {
    const key = this.generateKey(dto.name);
    const created = new this.menuRouteModel({
      name: dto.name,
      url: dto.url,
      key,
      menu_id: dto.menu_id,
      status: dto.status ?? 'active',
    });
    return created.save();
  }

  findAll() {
    return this.menuRouteModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const route = await this.menuRouteModel.findById(id).exec();
    if (!route) {
      throw new NotFoundException('Menu route not found');
    }
    return route;
  }

  async update(id: string, dto: UpdateMenuRouteDto) {
    const existing = await this.menuRouteModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Menu route not found');
    }

    const updateData: any = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.url !== undefined && { url: dto.url }),
      ...(dto.menu_id !== undefined && { menu_id: dto.menu_id }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

    // Auto-generate key if name is being updated
    if (dto.name !== undefined) {
      updateData.key = this.generateKey(dto.name);
    }

    const updated = await this.menuRouteModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.menuRouteModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Menu route not found');
    }
    return { deleted: true };
  }
}


