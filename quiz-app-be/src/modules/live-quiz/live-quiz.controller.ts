import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { LiveQuizService, QuestionDto } from './live-quiz.service';
import { JwtGuard } from '../../core/guards/jwt.guard';

@Controller('api/v1/live-quiz')
@UseGuards(JwtGuard)
export class LiveQuizController {
  constructor(private liveQuizService: LiveQuizService) {}

  /** Teacher: create session */
  @Post()
  async create(
    @Req() req: any,
    @Body() body: { title: string; class_id?: number; questions?: QuestionDto[] },
  ) {
    const session = await this.liveQuizService.create(
      req.user.id, body.title, body.class_id, body.questions,
    );
    return { code: 201, message: 'Session created', data: session };
  }

  /** Teacher: list my sessions */
  @Get('my')
  async mysessions(@Req() req: any) {
    const sessions = await this.liveQuizService.findByTeacher(req.user.id);
    return { code: 200, message: 'OK', data: sessions };
  }

  /** Student: join by PIN */
  @Get('join/:pin')
  async joinByPin(@Param('pin') pin: string) {
    const session = await this.liveQuizService.findByPin(pin);
    const questions = this.liveQuizService.parseQuestions(session);
    return {
      code: 200, message: 'OK',
      data: {
        ...session,
        questions, // parsed
        total_questions: questions.length,
      },
    };
  }

  /** Get session state (student polls this) */
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const session = await this.liveQuizService.findOne(id);
    const questions = this.liveQuizService.parseQuestions(session);
    return { code: 200, message: 'OK', data: { ...session, questions, total_questions: questions.length } };
  }

  /** Teacher: update questions */
  @Patch(':id/questions')
  async updateQuestions(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { questions: QuestionDto[] },
  ) {
    const session = await this.liveQuizService.updateQuestions(id, req.user.id, body.questions);
    return { code: 200, message: 'Updated', data: session };
  }

  /** Teacher: start / finish session */
  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string },
  ) {
    const session = await this.liveQuizService.updateStatus(id, req.user.id, body.status);
    return { code: 200, message: 'Updated', data: session };
  }

  /** Teacher: next question */
  @Patch(':id/next')
  async nextQuestion(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const session = await this.liveQuizService.nextQuestion(id, req.user.id);
    return { code: 200, message: 'OK', data: session };
  }

  /** Teacher: delete session */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.liveQuizService.delete(id, req.user.id);
  }
}
