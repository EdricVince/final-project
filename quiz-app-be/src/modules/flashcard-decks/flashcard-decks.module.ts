import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardDeck } from './entities/flashcard-deck.entity';
import { FlashcardDecksController } from './flashcard-decks.controller';
import { FlashcardDecksService } from './flashcard-decks.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([FlashcardDeck]), AuthModule],
  controllers: [FlashcardDecksController],
  providers: [FlashcardDecksService],
})
export class FlashcardDecksModule {}
