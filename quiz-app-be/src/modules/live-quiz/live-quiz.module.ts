import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveSession } from './entities/live-session.entity';
import { LiveQuizService } from './live-quiz.service';
import { LiveQuizController } from './live-quiz.controller';
import { LiveQuizGateway } from './live-quiz.gateway';
import { LiveQuizRoomService } from './live-quiz.room.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([LiveSession]), AuthModule],
  controllers: [LiveQuizController],
  providers: [LiveQuizService, LiveQuizRoomService, LiveQuizGateway],
  exports: [LiveQuizService],
})
export class LiveQuizModule {}
