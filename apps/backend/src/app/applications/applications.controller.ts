import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { createApplicationSchema } from '@talent-matching/dtos';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { updateApplicationSchema } from './dto/update-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createApplicationSchema))
    createApplicationDto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  findAll(
    @Query('candidateId') candidateId?: string,
    @Query('jobId') jobId?: string,
  ) {
    return this.applicationsService.findAll({ candidateId, jobId });
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(updateApplicationSchema))
    updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.applicationsService.remove(id);
  }
}
