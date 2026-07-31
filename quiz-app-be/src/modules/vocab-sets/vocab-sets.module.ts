import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabSet } from './entities/vocab-set.entity';
import { ClassEnrollment } from '../classes/entities/class-enrollment.entity';
import { VocabSetsController } from './vocab-sets.controller';
import { VocabSetsService } from './vocab-sets.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([VocabSet, ClassEnrollment]), AuthModule],
  controllers: [VocabSetsController],
  providers: [VocabSetsService],
})
export class VocabSetsModule {}
