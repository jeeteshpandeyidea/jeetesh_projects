import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GridSize, GridSizeSchema } from './schemas/grid-size.schema';
import { GridSizesService } from './grid-sizes.service';
import { GridSizesController } from './grid-sizes.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: GridSize.name, schema: GridSizeSchema }])],
  providers: [GridSizesService],
  controllers: [GridSizesController],
  exports: [MongooseModule, GridSizesService],
})
export class GridSizesModule {}
