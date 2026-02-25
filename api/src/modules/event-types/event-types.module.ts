import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventType, EventTypeSchema } from './schemas/event-type.schema';
import { EventTypesService } from './event-types.service';
import { EventTypesController } from './event-types.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventType.name, schema: EventTypeSchema },
    ]),
  ],
  providers: [EventTypesService],
  controllers: [EventTypesController],
  exports: [EventTypesService],
})
export class EventTypesModule {}

