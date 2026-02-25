import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { MenuModule } from './modules/menu/menu.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { UserResetsModule } from './modules/user-resets/user-resets.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventTypesModule } from './modules/event-types/event-types.module';
import { GameTypesModule } from './modules/game-types/game-types.module';
import { EligibilityModule } from './modules/eligibility/eligibility.module';
import { GridSizesModule } from './modules/grid-sizes/grid-sizes.module';
import { EventsModule } from './modules/events/events.module';
import { PropertyTypesModule } from './modules/property-types/property-types.module';
import { FacilitiesModule } from './modules/facilities/facilities.module';
import { RoomTypesModule } from './modules/room-types/room-types.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SubCategoriesModule } from './modules/subcategories/subcategories.module';
import { CardGenerationModule } from './modules/card-generation/card-generation.module';
import { WinningPatternModule } from './modules/winning-pattern/winning-pattern.module';
import { GamesModule } from './modules/games/games.module';
import { GameInvitesModule } from './modules/game-invites/game-invites.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { AchievementCriteriaModule } from './modules/achievement-criteria/achievement-criteria.module';
import { AssetsModule } from './modules/assets/assets.module';
import { GameCardsModule } from './modules/game-cards/game-cards.module';
import { WinningPatternTypesModule } from './modules/winning-pattern-types/winning-pattern-types.module';

function buildMongoUriFromParts(): string | undefined {
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const hostRaw = process.env.DATABASE_HOST;
  const dbName = process.env.DATABASE_NAME;

  if (!user || !password || !hostRaw || !dbName) return undefined;

  // tolerate common copy/paste issues like leading '@' and trailing '/'
  const host = hostRaw.replace(/^@+/, '').replace(/\/+$/, '');

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);

  // MongoDB Atlas SRV connection string format
  return `mongodb+srv://${encodedUser}:${encodedPassword}@${host}/${dbName}?retryWrites=true&w=majority`;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? buildMongoUriFromParts() ?? 'mongodb://localhost:27017/fringodb',
    ),
    RolesModule,
    UsersModule,
    MenuModule,
    AuditLogsModule,
    UserResetsModule,
    AuthModule,
    EventTypesModule,
    GameTypesModule,
    EligibilityModule,
    GridSizesModule,
    EventsModule,
    PropertyTypesModule,
    FacilitiesModule,
    RoomTypesModule,
    CategoriesModule,
    SubCategoriesModule,
    CardGenerationModule,
    WinningPatternModule,
    WinningPatternTypesModule,
    GamesModule,
    GameInvitesModule,
    RewardsModule,
    AchievementCriteriaModule,
    AssetsModule,
    GameCardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
