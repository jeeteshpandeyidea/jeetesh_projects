import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AchievementCriteria, AchievementCriteriaSchema } from './schemas/achievement-criteria.schema';
import { AchievementCriteriaService } from './achievement-criteria.service';
import { AchievementCriteriaController } from './achievement-criteria.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AchievementCriteria.name, schema: AchievementCriteriaSchema },
    ]),
  ],
  providers: [AchievementCriteriaService],
  controllers: [AchievementCriteriaController],
  exports: [AchievementCriteriaService],
})
export class AchievementCriteriaModule {}
