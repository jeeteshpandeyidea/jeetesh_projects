import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  findByEmail(email: string) {
    const normalized = (email != null && String(email).trim()) ? String(email).trim().toLowerCase() : '';
    return this.userModel.findOne({ email: normalized || email }).exec();
  }

  private async validateEmailUnique(email: string, excludeId?: string) {
    const emailNorm = (email || '').toLowerCase().trim();
    if (!emailNorm) throw new BadRequestException('Email is required');
    const q: Record<string, unknown> = { email: emailNorm };
    if (excludeId) q._id = { $ne: new Types.ObjectId(excludeId) };
    const existing = await this.userModel.findOne(q).select('_id').lean().exec();
    if (existing) throw new BadRequestException('Email already in use');
  }

  private async validatePhoneUnique(phone: string, excludeId?: string) {
    const phoneNorm = (phone || '').trim();
    if (!phoneNorm) throw new BadRequestException('Phone number is required');
    const q: Record<string, unknown> = { phone: phoneNorm };
    if (excludeId) q._id = { $ne: new Types.ObjectId(excludeId) };
    const existing = await this.userModel.findOne(q).select('_id').lean().exec();
    if (existing) throw new BadRequestException('Phone number already in use');
  }

  async create(dto: CreateUserDto) {
    await this.validateEmailUnique(dto.email);
    const phoneNorm = (dto.phone ?? '').trim();
    if (phoneNorm) await this.validatePhoneUnique(phoneNorm);
    const created = new this.userModel({
      email: dto.email,
      username: dto.username,
      password: dto.password,
      roles: dto.roles ?? [],
      fullName: dto.fullName,
      phone: phoneNorm || undefined,
      profilePhoto: dto.profilePhoto,
    });
    return created.save();
  }

  async findAll() {
    const users = await this.userModel.find().select('-password').sort({ createdAt: -1 }).lean().exec();
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        try {
          const roleDetails = await this.getRoleDetails((user as { roles?: string[] }).roles);
          return {
            ...user,
            roles: roleDetails,
          };
        } catch {
          return { ...user, roles: [] };
        }
      }),
    );
    return usersWithRoles;
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).select('-password').lean().exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    let roleDetails: unknown[] = [];
    try {
      roleDetails = await this.getRoleDetails((user as { roles?: string[] }).roles);
    } catch {
      // keep roles empty on error
    }
    return {
      ...user,
      roles: roleDetails,
    };
  }

  private async getRoleDetails(roleSlugsOrIds: string[] | undefined | null) {
    const arr = Array.isArray(roleSlugsOrIds)
      ? roleSlugsOrIds.filter((x) => x != null && String(x).trim() !== '')
      : [];
    if (arr.length === 0) return [];

    const asStrings = arr.map((x) => String(x).trim());

    // Find roles by slug first
    const roles = await this.roleModel.find({ slug: { $in: asStrings } }).lean().exec();
    const foundSlugs = (roles as { slug: string }[]).map((r) => r.slug);
    const missing = asStrings.filter((s) => !foundSlugs.includes(s));
    if (missing.length === 0) return roles as unknown as RoleDocument[];

    // For any not found by slug, try by _id only if valid ObjectId (avoid CastError)
    const validIds = missing.filter((id) => Types.ObjectId.isValid(id) && String(id).length === 24);
    if (validIds.length > 0) {
      const rolesById = await this.roleModel
        .find({ _id: { $in: validIds.map((id) => new Types.ObjectId(id)) } })
        .lean()
        .exec();
      (roles as unknown[]).push(...rolesById);
    }

    return roles as unknown as RoleDocument[];
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.email !== undefined) await this.validateEmailUnique(dto.email, id);
    if (dto.phone !== undefined && (dto.phone ?? '').trim()) await this.validatePhoneUnique(dto.phone.trim(), id);
    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.email !== undefined && { email: dto.email }),
            ...(dto.username !== undefined && { username: dto.username }),
            ...(dto.password !== undefined && { password: dto.password }),
            ...(dto.roles !== undefined && { roles: dto.roles }),
            ...(dto.fullName !== undefined && { fullName: dto.fullName }),
            ...(dto.phone !== undefined && { phone: (dto.phone ?? '').trim() || undefined }),
            ...(dto.profilePhoto !== undefined && {
              profilePhoto: dto.profilePhoto,
            }),
            ...(dto.emailVerified !== undefined && {
              emailVerified: dto.emailVerified,
            }),
            ...(dto.phoneVerified !== undefined && {
              phoneVerified: dto.phoneVerified,
            }),
            ...(dto.is_deleted !== undefined && { is_deleted: dto.is_deleted }),
            ...(dto.status !== undefined && { status: dto.status }),
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
    return { deleted: true };
  }
}


