import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Menu, MenuSchema } from './schemas/menu.schema';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MenuRoute, MenuRouteSchema } from './schemas/menu-route.schema';
import { MenuRouteService } from './menu-route.service';
import { MenuRouteController } from './menu-route.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Menu.name, schema: MenuSchema },
      { name: MenuRoute.name, schema: MenuRouteSchema },
    ]),
  ],
  providers: [MenuService, MenuRouteService],
  controllers: [MenuController, MenuRouteController],
  exports: [MenuService, MenuRouteService],
})
export class MenuModule {}
