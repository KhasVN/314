import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';
import { SearchService } from './search.service';

@Module({
  imports: [AiModule, DatabaseModule],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
