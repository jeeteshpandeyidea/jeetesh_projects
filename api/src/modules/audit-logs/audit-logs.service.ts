import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  create(dto: CreateAuditLogDto) {
    const created = new this.auditLogModel({
      actor_user_id: dto.actor_user_id,
      target_type: dto.target_type,
      action: dto.action,
      description: dto.description,
      ipAddress: dto.ipAddress,
    });
    return created.save();
  }

  findAll() {
    return this.auditLogModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const log = await this.auditLogModel.findById(id).exec();
    if (!log) {
      throw new NotFoundException('Audit log not found');
    }
    return log;
  }

  async update(id: string, dto: UpdateAuditLogDto) {
    const updated = await this.auditLogModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.actor_user_id !== undefined && {
              actor_user_id: dto.actor_user_id,
            }),
            ...(dto.target_type !== undefined && { target_type: dto.target_type }),
            ...(dto.action !== undefined && { action: dto.action }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.ipAddress !== undefined && { ipAddress: dto.ipAddress }),
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Audit log not found');
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.auditLogModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Audit log not found');
    }
    return { deleted: true };
  }
}


