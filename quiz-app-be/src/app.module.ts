import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ProgressModule } from './modules/progress/progress.module';
import { GoalsModule } from './modules/goals/goals.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';
import { VideosModule } from './modules/videos/videos.module';
import { LiveQuizModule } from './modules/live-quiz/live-quiz.module';
import { EntranceExamModule } from './modules/entrance-exam/entrance-exam.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { SkillsModule } from './modules/skills/skills.module';
import { LessonsModule } from './modules/lessons/lessons.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    ClassesModule,
    ProgressModule,
    GoalsModule,
    AdminModule,
    AiModule,
    VideosModule,
    LiveQuizModule,
    EntranceExamModule,
    ScheduleModule,
    SkillsModule,
    LessonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
