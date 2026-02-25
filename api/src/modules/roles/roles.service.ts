import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  private buildSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s\_]+/g, '-') // spaces/underscores -> dash
      .replace(/[^a-z0-9\-]/g, '') // remove non-url chars
      .replace(/\-+/g, '-'); // collapse multiple dashes
  }

  private async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const query: any = { slug };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      
      const existingRole = await this.roleModel.findOne(query).exec();
      
      if (!existingRole) {
        // Slug is unique, return it
        return slug;
      }
      
      // Slug exists, try with a number suffix
      slug = `${baseSlug}-${counter}`;
      counter++;
      
      // Safety check to prevent infinite loop
      if (counter > 1000) {
        // Fallback: use timestamp if we can't find a unique slug
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }
    
    return slug;
  }

  async create(dto: CreateRoleDto) {
    const baseSlug = this.buildSlug(dto.name);
    
    // Generate unique slug if base slug already exists
    const uniqueSlug = await this.generateUniqueSlug(baseSlug);
    
    const created = new this.roleModel({
      name: dto.name,
      slug: uniqueSlug,
      description: dto.description,
      permissions: dto.permissions ?? [],
    });
    return created.save();
  }

  findAll() {
    return this.roleModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    // Check if role exists first
    const existingRole = await this.roleModel.findById(id).exec();
    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    let slug: string | undefined = undefined;

    // If name is being updated, generate unique slug
    if (dto.name !== undefined) {
      const baseSlug = this.buildSlug(dto.name);
      
      // Check if the new slug is different from current slug
      if (baseSlug !== existingRole.slug) {
        // Generate unique slug if base slug already exists (excluding current role)
        slug = await this.generateUniqueSlug(baseSlug, id);
      } else {
        // Slug is the same, keep it
        slug = existingRole.slug;
      }
    }

    const updated = await this.roleModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.name !== undefined && { name: dto.name }),
            ...(slug !== undefined && { slug }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.permissions !== undefined && { permissions: dto.permissions }),
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Role not found');
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.roleModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Role not found');
    }
    return { deleted: true };
  }
}


