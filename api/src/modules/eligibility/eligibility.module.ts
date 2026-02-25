import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Eligibility, EligibilitySchema } from './schemas/eligibility.schema';
import { EligibilityService } from './eligibility.service';
import { EligibilityController } from './eligibility.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Eligibility.name, schema: EligibilitySchema }])],
  providers: [EligibilityService],
  controllers: [EligibilityController],
  exports: [EligibilityService],
})
export class EligibilityModule {}
