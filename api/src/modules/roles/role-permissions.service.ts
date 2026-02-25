import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RolePermission, RolePermissionDocument } from './schemas/role-permission.schema';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectModel(RolePermission.name)
    private readonly rolePermissionModel: Model<RolePermissionDocument>,
  ) {}

  create(dto: CreateRolePermissionDto) {
    const created = new this.rolePermissionModel({
      role_id: dto.role_id,
      module: dto.module,
      permission: dto.permission,
      menu_id: dto.menu_id,
    });
    return created.save();
  }

  findAll() {
    return this.rolePermissionModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const doc = await this.rolePermissionModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException('Role permission not found');
    }
    return doc;
  }

  async update(id: string, dto: UpdateRolePermissionDto) {
    const updated = await this.rolePermissionModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.role_id !== undefined && { role_id: dto.role_id }),
            ...(dto.module !== undefined && { module: dto.module }),
            ...(dto.permission !== undefined && { permission: dto.permission }),
            ...(dto.menu_id !== undefined && { menu_id: dto.menu_id }),
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Role permission not found');
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.rolePermissionModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Role permission not found');
    }
    return { deleted: true };
  }
}


