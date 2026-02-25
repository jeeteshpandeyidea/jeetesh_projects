import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyType, PropertyTypeSchema } from './schemas/property-type.schema';
import { PropertyTypesService } from './property-types.service';
import { PropertyTypesController } from './property-types.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyType.name, schema: PropertyTypeSchema },
    ]),
  ],
  providers: [PropertyTypesService],
  controllers: [PropertyTypesController],
  exports: [PropertyTypesService],
})
export class PropertyTypesModule {}

