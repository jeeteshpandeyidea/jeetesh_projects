import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserReset, UserResetSchema } from './schemas/user-reset.schema';
import { UserResetsService } from './user-resets.service';
import { UserResetsController } from './user-resets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserReset.name, schema: UserResetSchema }]),
  ],
  providers: [UserResetsService],
  controllers: [UserResetsController],
  exports: [UserResetsService],
})
export class UserResetsModule {}


