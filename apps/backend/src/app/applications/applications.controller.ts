import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  // ── GET /api/applications ─────────────────────────────────────
  // Returns a list of applications filtered by optional query params.
  // Usage examples:
  //   GET /api/applications                    → all applications
  //   GET /api/applications?candidateId=xxx    → applications by a specific candidate
  //   GET /api/applications?jobId=xxx          → applications for a specific job
  @Get()
  findAll(@Query('candidateId') candidateId?: string, @Query('jobId') jobId?: string) {
    return this.applicationsService.findAll({ candidateId, jobId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }
}
