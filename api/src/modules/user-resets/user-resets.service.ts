import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserReset, UserResetDocument } from './schemas/user-reset.schema';
import { CreateUserResetDto } from './dto/create-user-reset.dto';
import { UpdateUserResetDto } from './dto/update-user-reset.dto';

@Injectable()
export class UserResetsService {
  constructor(
    @InjectModel(UserReset.name)
    private readonly userResetModel: Model<UserResetDocument>,
  ) {}

  create(dto: CreateUserResetDto) {
    const created = new this.userResetModel({
      user_id: dto.user_id,
      code: dto.code,
      type: dto.type,
      expiresAt: dto.expiresAt,
      link: dto.link,
    });
    return created.save();
  }

  findAll() {
    return this.userResetModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const reset = await this.userResetModel.findById(id).exec();
    if (!reset) {
      throw new NotFoundException('User reset not found');
    }
    return reset;
  }

  async update(id: string, dto: UpdateUserResetDto) {
    const updated = await this.userResetModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.user_id !== undefined && { user_id: dto.user_id }),
            ...(dto.code !== undefined && { code: dto.code }),
            ...(dto.type !== undefined && { type: dto.type }),
            ...(dto.expiresAt !== undefined && { expiresAt: dto.expiresAt }),
            ...(dto.link !== undefined && { link: dto.link }),
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('User reset not found');
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.userResetModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('User reset not found');
    }
    return { deleted: true };
  }
}


