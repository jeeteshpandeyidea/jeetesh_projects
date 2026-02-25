import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WinningPatternType, WinningPatternTypeSchema } from './schemas/winning-pattern-type.schema';
import { WinningPatternTypesService } from './winning-pattern-types.service';
import { WinningPatternTypesController } from './winning-pattern-types.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WinningPatternType.name, schema: WinningPatternTypeSchema }]),
  ],
  providers: [WinningPatternTypesService],
  controllers: [WinningPatternTypesController],
  exports: [MongooseModule, WinningPatternTypesService],
})
export class WinningPatternTypesModule {}
