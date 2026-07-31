import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtGuard } from '../../core/guards/jwt.guard';
import { FlashcardDecksService, CreateFlashcardDeckDto, UpdateFlashcardDeckDto } from './flashcard-decks.service';

// Any authenticated user (student or teacher) can create/own flashcard decks;
// public decks are shared so everyone can study them. Owner-only writes.
@Controller('api/v1/flashcard-decks')
@UseGuards(JwtGuard)
export class FlashcardDecksController {
  constructor(private readonly service: FlashcardDecksService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateFlashcardDeckDto) {
    const deck = await this.service.create(req.user.id, dto);
    return { code: 201, message: 'Flashcard deck created', data: deck };
  }

  @Get()
  async findAll(@Req() req: any) {
    const decks = await this.service.findForUser(req.user.id);
    return { code: 200, message: 'OK', data: decks };
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const deck = await this.service.findOne(id, req.user.id);
    return { code: 200, message: 'OK', data: deck };
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFlashcardDeckDto) {
    const deck = await this.service.update(id, req.user.id, dto);
    return { code: 200, message: 'Updated', data: deck };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id, req.user.id);
  }
}
