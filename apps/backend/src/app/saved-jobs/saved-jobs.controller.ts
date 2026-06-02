import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { SavedJobsService } from './saved-jobs.service';

@Controller('saved-jobs')
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  // POST /saved-jobs  body: { candidateId, jobId }
  @Post()
  create(@Body() body: { candidateId: string; jobId: string }) {
    return this.savedJobsService.create(body.candidateId, body.jobId);
  }

  // GET /saved-jobs?candidateId=xxx
  @Get()
  findAll(@Query('candidateId') candidateId: string) {
    return this.savedJobsService.findAll(candidateId);
  }

  // DELETE /saved-jobs/:id
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.savedJobsService.remove(id);
  }
}
