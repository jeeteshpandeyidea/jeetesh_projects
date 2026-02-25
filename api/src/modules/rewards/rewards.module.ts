import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reward, RewardSchema } from './schemas/reward.schema';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reward.name, schema: RewardSchema }]),
  ],
  providers: [RewardsService],
  controllers: [RewardsController],
  exports: [RewardsService],
})
export class RewardsModule {}
