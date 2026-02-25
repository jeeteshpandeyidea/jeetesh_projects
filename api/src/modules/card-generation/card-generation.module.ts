import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CardGeneration, CardGenerationSchema } from './schemas/card-generation.schema';
import { CardGenerationService } from './card-generation.service';
import { CardGenerationController } from './card-generation.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CardGeneration.name, schema: CardGenerationSchema }]),
  ],
  providers: [CardGenerationService],
  controllers: [CardGenerationController],
  exports: [CardGenerationService],
})
export class CardGenerationModule {}
