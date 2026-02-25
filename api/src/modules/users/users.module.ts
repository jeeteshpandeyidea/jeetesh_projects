import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { UserSession, UserSessionSchema } from './schemas/user-session.schema';
import { UserSessionsService } from './user-sessions.service';
import { UserSessionsController } from './user-sessions.controller';
import { LoginLog, LoginLogSchema } from './schemas/login-log.schema';
import { LoginLogsService } from './login-logs.service';
import { LoginLogsController } from './login-logs.controller';
import { Role, RoleSchema } from '../roles/schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: LoginLog.name, schema: LoginLogSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  providers: [UsersService, UserSessionsService, LoginLogsService],
  controllers: [UsersController, UserSessionsController, LoginLogsController],
  exports: [MongooseModule, UsersService, UserSessionsService, LoginLogsService],
})
export class UsersModule {}
