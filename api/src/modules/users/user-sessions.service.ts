import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSession, UserSessionDocument } from './schemas/user-session.schema';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { UpdateUserSessionDto } from './dto/update-user-session.dto';

@Injectable()
export class UserSessionsService {
  constructor(
    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSessionDocument>,
  ) {}

  create(dto: CreateUserSessionDto) {
    const created = new this.userSessionModel({
      user_id: dto.user_id,
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      deviceId: dto.deviceId,
      deviceInfo: dto.deviceInfo,
      deviceName: dto.deviceName,
      deviceType: dto.deviceType,
      userAgent: dto.userAgent,
      ipAddress: dto.ipAddress,
      location: dto.location,
      expiresAt: dto.expiresAt,
      refreshExpiresAt: dto.refreshExpiresAt,
      isActive: true,
      lastUsedAt: new Date(),
    });
    return created.save();
  }

  findAll() {
    return this.userSessionModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const session = await this.userSessionModel.findById(id).exec();
    if (!session) {
      throw new NotFoundException('User session not found');
    }
    return session;
  }

  async update(id: string, dto: UpdateUserSessionDto) {
    const updated = await this.userSessionModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.user_id !== undefined && { user_id: dto.user_id }),
            ...(dto.refreshToken !== undefined && { refreshToken: dto.refreshToken }),
            ...(dto.accessToken !== undefined && { accessToken: dto.accessToken }),
            ...(dto.deviceInfo !== undefined && { deviceInfo: dto.deviceInfo }),
            ...(dto.deviceName !== undefined && { deviceName: dto.deviceName }),
            ...(dto.deviceType !== undefined && { deviceType: dto.deviceType }),
            ...(dto.ipAddress !== undefined && { ipAddress: dto.ipAddress }),
            ...(dto.location !== undefined && { location: dto.location }),
            ...(dto.expiresAt !== undefined && { expiresAt: dto.expiresAt }),
            ...(dto.createdAt !== undefined && { createdAt: dto.createdAt }),
            ...(dto.revokedAt !== undefined && { revokedAt: dto.revokedAt }),
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('User session not found');
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.userSessionModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('User session not found');
    }
    return { deleted: true };
  }

  async findByAccessToken(accessToken: string) {
    return this.userSessionModel.findOne({ accessToken, isActive: true }).exec();
  }

  async findByRefreshToken(refreshToken: string) {
    return this.userSessionModel.findOne({ refreshToken, isActive: true }).exec();
  }

  async findByUserId(userId: string) {
    return this.userSessionModel.find({ user_id: userId, isActive: true }).exec();
  }

  async findByDeviceId(deviceId: string) {
    return this.userSessionModel.find({ deviceId, isActive: true }).exec();
  }

  async findByUserIdAndDeviceType(userId: string, deviceType: string) {
    return this.userSessionModel
      .find({ user_id: userId, deviceType, isActive: true })
      .exec();
  }

  async revokeSessionsByUserIdAndDeviceType(userId: string, deviceType: string, reason?: string) {
    return this.userSessionModel
      .updateMany(
        { user_id: userId, deviceType, isActive: true },
        {
          $set: {
            isActive: false,
            revokedAt: new Date(),
            revokedBy: reason || 'New login on same device type',
          },
        },
      )
      .exec();
  }

  async updateLastUsed(sessionId: string) {
    return this.userSessionModel
      .findByIdAndUpdate(sessionId, { lastUsedAt: new Date() }, { new: true })
      .exec();
  }

  async revokeSession(sessionId: string, reason?: string) {
    return this.userSessionModel
      .findByIdAndUpdate(
        sessionId,
        {
          $set: {
            isActive: false,
            revokedAt: new Date(),
            revokedBy: reason || 'Session revoked',
          },
        },
        { new: true },
      )
      .exec();
  }

  async revokeAllUserSessions(userId: string, reason?: string) {
    return this.userSessionModel
      .updateMany(
        { user_id: userId, isActive: true },
        {
          $set: {
            isActive: false,
            revokedAt: new Date(),
            revokedBy: reason || 'All sessions revoked',
          },
        },
      )
      .exec();
  }
}


