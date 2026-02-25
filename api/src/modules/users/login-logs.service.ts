import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginLog, LoginLogDocument } from './schemas/login-log.schema';
import { CreateLoginLogDto } from './dto/create-login-log.dto';
import { UpdateLoginLogDto } from './dto/update-login-log.dto';

@Injectable()
export class LoginLogsService {
  constructor(
    @InjectModel(LoginLog.name)
    private readonly loginLogModel: Model<LoginLogDocument>,
  ) {}

  create(dto: CreateLoginLogDto) {
    const created = new this.loginLogModel({
      user_id: dto.user_id,
      emailAttempted: dto.emailAttempted,
      userAgent: dto.userAgent,
      ipAddress: dto.ipAddress,
      status: dto.status,
      failureReason: dto.failureReason,
      deviceName: dto.deviceName,
      deviceType: dto.deviceType,
      deviceInfo: dto.deviceInfo,
      location: dto.location,
      loginAt: dto.loginAt || new Date(),
    });
    return created.save();
  }

  findAll() {
    return this.loginLogModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const log = await this.loginLogModel.findById(id).exec();
    if (!log) {
      throw new NotFoundException('Login log not found');
    }
    return log;
  }

  async update(id: string, dto: UpdateLoginLogDto) {
    const updated = await this.loginLogModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.user_id !== undefined && { user_id: dto.user_id }),
            ...(dto.emailAttempted !== undefined && {
              emailAttempted: dto.emailAttempted,
            }),
            ...(dto.userAgent !== undefined && { userAgent: dto.userAgent }),
            ...(dto.ipAddress !== undefined && { ipAddress: dto.ipAddress }),
            ...(dto.status !== undefined && { status: dto.status }),
            ...(dto.failureReason !== undefined && {
              failureReason: dto.failureReason,
            }),
            ...(dto.deviceName !== undefined && { deviceName: dto.deviceName }),
            ...(dto.deviceType !== undefined && { deviceType: dto.deviceType }),
            ...(dto.deviceInfo !== undefined && { deviceInfo: dto.deviceInfo }),
            ...(dto.location !== undefined && { location: dto.location }),
            ...(dto.loginAt !== undefined && { loginAt: dto.loginAt }),
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Login log not found');
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.loginLogModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Login log not found');
    }
    return { deleted: true };
  }

  async findByUserId(userId: string, limit: number = 50) {
    return this.loginLogModel
      .find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByEmail(email: string, limit: number = 50) {
    return this.loginLogModel
      .find({ emailAttempted: email })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByStatus(status: string, limit: number = 50) {
    return this.loginLogModel
      .find({ status })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByIpAddress(ipAddress: string, limit: number = 50) {
    return this.loginLogModel
      .find({ ipAddress })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getFailedLoginAttempts(email: string, hours: number = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.loginLogModel
      .countDocuments({
        emailAttempted: email,
        status: 'failed',
        createdAt: { $gte: since },
      })
      .exec();
  }
}


