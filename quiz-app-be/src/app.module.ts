import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProgressModule } from './modules/progress/progress.module';
import { GoalsModule } from './modules/goals/goals.module';

@Module({
  imports: [CoreModule, AuthModule, ProgressModule, GoalsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
