import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WinningPattern, WinningPatternSchema } from './schemas/winning-pattern.schema';
import { WinningPatternService } from './winning-pattern.service';
import { WinningPatternController } from './winning-pattern.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WinningPattern.name, schema: WinningPatternSchema }]),
  ],
  providers: [WinningPatternService],
  controllers: [WinningPatternController],
  exports: [MongooseModule, WinningPatternService],
})
export class WinningPatternModule {}
