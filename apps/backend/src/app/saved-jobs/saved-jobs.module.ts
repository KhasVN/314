import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SavedJobsService } from './saved-jobs.service';
import { SavedJobsController } from './saved-jobs.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [SavedJobsController],
  providers: [SavedJobsService],
})
export class SavedJobsModule {}
