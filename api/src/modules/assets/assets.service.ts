import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Asset, AssetDocument } from './schemas/asset.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

function toObjectId(value: string | undefined, field: string): Types.ObjectId {
  const trimmed = value?.trim();
  if (!trimmed) throw new BadRequestException(`${field} is required`);
  if (!Types.ObjectId.isValid(trimmed)) throw new BadRequestException(`Invalid ${field}`);
  return new Types.ObjectId(trimmed);
}

function toObjectIdOptional(value: string | undefined, field: string): Types.ObjectId | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (!Types.ObjectId.isValid(trimmed)) throw new BadRequestException(`Invalid ${field}`);
  return new Types.ObjectId(trimmed);
}

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name)
    private readonly model: Model<AssetDocument>,
  ) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'asset';
  }

  private async generateNextCode(): Promise<string> {
    const prefix = 'BNG';
    const docs = await this.model
      .find({ code: new RegExp(`^${prefix}\\d+$`, 'i') })
      .select('code')
      .lean()
      .exec();
    let max = 0;
    for (const d of docs) {
      const n = parseInt((d as { code: string }).code?.replace(prefix, '') || '0', 10);
      if (n > max) max = n;
    }
    return `${prefix}${String(max + 1).padStart(3, '0')}`;
  }

  async create(dto: CreateAssetDto) {
    const categoryId = toObjectId(dto.categoryId, 'categoryId');
    const subcategoryId = toObjectIdOptional(dto.subcategoryId, 'subcategoryId');
    const code = dto.code?.trim().toUpperCase() || (await this.generateNextCode());
    const slug = dto.slug || this.generateSlug(dto.title);
    const created = new this.model({
      title: dto.title,
      code,
      slug,
      description: dto.description ?? '',
      imageUrl: dto.imageUrl,
      thumbnailUrl: dto.thumbnailUrl ?? '',
      categoryId,
      subcategoryId,
      accessLevel: dto.accessLevel ?? 'FREE',
      isPlaceholder: dto.isPlaceholder ?? false,
      status: dto.status ?? 'ACTIVE',
      sortOrder: dto.sortOrder ?? 0,
      tags: dto.tags ?? [],
      usageCount: 0,
      createdBy: dto.createdBy ? toObjectIdOptional(dto.createdBy, 'createdBy') : undefined,
    });
    try {
      return await created.save();
    } catch (err: unknown) {
      const errCode = (err as { code?: number })?.code;
      if (errCode === 11000) {
        const msg = (err as { message?: string })?.message ?? '';
        throw new ConflictException(
          msg.includes('slug') ? 'An asset with this title/slug already exists.' : 'An asset with this code already exists.',
        );
      }
      throw err;
    }
  }

  findAll() {
    return this.model
      .find()
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const doc = await this.model
      .findById(id)
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .exec();
    if (!doc) throw new NotFoundException('Asset not found');
    return doc;
  }

  async update(id: string, dto: UpdateAssetDto) {
    const existing = await this.model.findById(id).exec();
    if (!existing) throw new NotFoundException('Asset not found');

    const updateData: Record<string, unknown> = {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.code !== undefined && { code: dto.code.trim().toUpperCase() }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      ...(dto.thumbnailUrl !== undefined && { thumbnailUrl: dto.thumbnailUrl }),
      ...(dto.categoryId !== undefined && { categoryId: toObjectId(dto.categoryId, 'categoryId') }),
      ...(dto.subcategoryId !== undefined && { subcategoryId: toObjectIdOptional(dto.subcategoryId, 'subcategoryId') ?? null }),
      ...(dto.accessLevel !== undefined && { accessLevel: dto.accessLevel }),
      ...(dto.isPlaceholder !== undefined && { isPlaceholder: dto.isPlaceholder }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.updatedBy !== undefined && { updatedBy: new Types.ObjectId(dto.updatedBy) }),
    };
    if (dto.title !== undefined) updateData.slug = this.generateSlug(dto.title);
    else if (dto.slug !== undefined) updateData.slug = dto.slug;

    return this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('categoryId', 'name slug')
      .populate('subcategoryId', 'name slug')
      .exec();
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Asset not found');
    return { deleted: true };
  }
}
