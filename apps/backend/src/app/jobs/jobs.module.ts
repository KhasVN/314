import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';
import { SearchModule } from '../search/search.module';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';

@Module({
  imports: [AiModule, DatabaseModule, SearchModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
