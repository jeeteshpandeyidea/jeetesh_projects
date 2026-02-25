import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { UserSessionsService } from '../users/user-sessions.service';
import { LoginLogsService } from '../users/login-logs.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { parseDeviceInfo } from './utils/device-parser.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly userSessionsService: UserSessionsService,
    private readonly loginLogsService: LoginLogsService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      roles: dto.roles ?? ['user'],
      fullName: dto.fullName,
      phone: dto.phone,
      profilePhoto: dto.profilePhoto,
    });

    const accessToken = await this.signToken(user.id, user.email, user.roles);

    return { user, accessToken };
  }

  async validateUser(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const emailNorm = (email != null && String(email).trim()) ? String(email).trim().toLowerCase() : '';
    const user = await this.usersService.findByEmail(emailNorm || email);
    if (!user) {
      if (ipAddress && userAgent) {
        try {
          const deviceInfo = parseDeviceInfo(userAgent);
          const emailAttempted = (email != null && String(email).trim()) ? String(email).trim() : 'unknown';
          await this.loginLogsService.create({
            emailAttempted,
            userAgent,
            ipAddress,
            status: 'failed',
            failureReason: 'User not found',
            deviceName: deviceInfo.deviceName,
            deviceType: deviceInfo.deviceType,
            deviceInfo: `${deviceInfo.browser} on ${deviceInfo.os}`,
            loginAt: new Date(),
          });
        } catch (logErr) {
          this.logger.warn(`Failed to create login log: ${logErr}`);
        }
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if password is stored as bcrypt hash (starts with $2a$, $2b$, or $2y$)
    const isHashed = user.password && (
      user.password.startsWith('$2a$') ||
      user.password.startsWith('$2b$') ||
      user.password.startsWith('$2y$')
    );

    let passwordValid = false;

    if (isHashed) {
      // Password is hashed, use bcrypt.compare
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Password is stored as plain text (backward compatibility)
      // Do direct string comparison
      passwordValid = password === user.password;
      
      if (passwordValid) {
        const uid = (user as { _id?: unknown })._id != null ? String((user as { _id: unknown })._id) : (user as { id?: string }).id;
        if (uid) {
          try {
            this.logger.warn(`User ${user.email} has plain text password. Hashing and updating...`);
            const hashedPassword = await bcrypt.hash(password, 10);
            await this.usersService.update(uid, { password: hashedPassword });
            this.logger.log(`Password hashed and updated for user ${user.email}`);
          } catch (updateErr) {
            this.logger.warn(`Could not hash and update password: ${updateErr}`);
          }
        }
      }
    }

    if (!passwordValid) {
      if (ipAddress && userAgent) {
        try {
          const deviceInfo = parseDeviceInfo(userAgent);
          const emailAttempted = (email != null && String(email).trim()) ? String(email).trim() : 'unknown';
          const uid = (user as { _id?: unknown })._id != null ? String((user as { _id: unknown })._id) : (user as { id?: string }).id;
          await this.loginLogsService.create({
            user_id: uid,
            emailAttempted,
            userAgent,
            ipAddress,
            status: 'failed',
            failureReason: 'Invalid password',
            deviceName: deviceInfo.deviceName,
            deviceType: deviceInfo.deviceType,
            deviceInfo: `${deviceInfo.browser} on ${deviceInfo.os}`,
            loginAt: new Date(),
          });
        } catch (logErr) {
          this.logger.warn(`Failed to create login log: ${logErr}`);
        }
      }
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    // Parse device information early for logging
    const deviceInfo = parseDeviceInfo(userAgent || 'unknown');

    let user: Awaited<ReturnType<AuthService['validateUser']>>;
    try {
      user = await this.validateUser(dto.email, dto.password, ipAddress, userAgent);
    } catch (error) {
      throw error;
    }

    const userObj = user as { _id?: unknown; id?: string; email: string; roles?: string[]; fullName?: string; username?: string; phone?: string; profilePhoto?: string; status?: string };
    const userId = userObj._id != null ? String(userObj._id) : (userObj.id ?? '');
    if (!userId) {
      this.logger.error('User object missing _id and id');
      throw new UnauthorizedException('Invalid user data');
    }
    const roles = Array.isArray(userObj.roles) ? userObj.roles : [];

    // Generate tokens
    const accessToken = await this.signAccessToken(userId, userObj.email, roles);
    const refreshToken = await this.signRefreshToken(userId, userObj.email, roles);

    const accessTokenExpiry = new Date();
    accessTokenExpiry.setHours(accessTokenExpiry.getHours() + 24);
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30);
    const deviceId = this.generateDeviceId();

    // Revoke existing active sessions for the same user and device type
    try {
      const existingSessions = await this.userSessionsService.findByUserIdAndDeviceType(
        userId,
        deviceInfo.deviceType,
      );
      if (existingSessions?.length > 0) {
        await this.userSessionsService.revokeSessionsByUserIdAndDeviceType(
          userId,
          deviceInfo.deviceType,
          'New login on same device type',
        );
      }
    } catch (err) {
      this.logger.warn(`Could not revoke existing sessions: ${err}`);
    }

    const session = await this.userSessionsService.create({
      user_id: userId,
      accessToken,
      refreshToken,
      deviceId,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      deviceInfo: `${deviceInfo.browser} on ${deviceInfo.os}`,
      userAgent: userAgent,
      ipAddress: ipAddress,
      expiresAt: accessTokenExpiry,
      refreshExpiresAt: refreshTokenExpiry,
    });

    try {
      const emailAttempted = (dto.email != null && String(dto.email).trim()) ? String(dto.email).trim() : userObj.email || 'unknown';
      await this.loginLogsService.create({
        user_id: userId,
        emailAttempted,
        userAgent: userAgent,
        ipAddress: ipAddress,
        status: 'success',
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        deviceInfo: `${deviceInfo.browser} on ${deviceInfo.os}`,
        loginAt: new Date(),
      });
    } catch (err) {
      this.logger.warn(`Could not create login log: ${err}`);
    }

    const sessionDoc = session as { _id?: unknown; id?: string };
    const sessionId = sessionDoc.id ?? sessionDoc._id;
    const safeUser = {
      id: userId,
      _id: userId,
      email: userObj.email,
      fullName: userObj.fullName,
      username: userObj.username,
      roles,
      phone: userObj.phone,
      profilePhoto: userObj.profilePhoto,
      status: userObj.status,
    };
    return {
      user: safeUser,
      accessToken,
      refreshToken,
      session: {
        id: sessionId != null ? String(sessionId) : undefined,
        deviceId: session.deviceId,
        expiresAt: session.expiresAt,
        refreshExpiresAt: session.refreshExpiresAt,
      },
    };
  }

  private signAccessToken(userId: string, email: string, roles: string[]) {
    const payload = { sub: userId, email, roles, type: 'access' };
    return this.jwtService.signAsync(payload, { expiresIn: '1h' });
  }

  private signRefreshToken(userId: string, email: string, roles: string[]) {
    const payload = { sub: userId, email, roles, type: 'refresh' };
    return this.jwtService.signAsync(payload, { expiresIn: '30d' });
  }

  private generateDeviceId(): string {
    return randomBytes(16).toString('hex');
  }

  private signToken(userId: string, email: string, roles: string[]) {
    const payload = { sub: userId, email, roles };
    return this.jwtService.signAsync(payload);
  }
}


