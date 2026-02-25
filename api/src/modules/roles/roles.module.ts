import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role, RoleSchema } from './schemas/role.schema';
import { RolePermission, RolePermissionSchema } from './schemas/role-permission.schema';
import { RolePermissionsService } from './role-permissions.service';
import { RolePermissionsController } from './role-permissions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: RolePermission.name, schema: RolePermissionSchema },
    ]),
  ],
  providers: [RolesService, RolePermissionsService],
  controllers: [RolesController, RolePermissionsController],
  exports: [RolesService, RolePermissionsService],
})
export class RolesModule {}
