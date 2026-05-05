import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  candidateSearchQuerySchema,
  createCandidateSchema,
  type CandidateSearchQueryDto,
} from '@talent-matching/dtos';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { updateCandidateSchema } from './dto/update-candidate.dto';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createCandidateSchema))
    createCandidateDto: CreateCandidateDto,
  ) {
    return this.candidatesService.create(createCandidateDto);
  }

  @Get()
  findAll() {
    return this.candidatesService.findAll();
  }

  @Get('search')
  search(
    @Query(new ZodValidationPipe(candidateSearchQuerySchema))
    query: CandidateSearchQueryDto,
  ) {
    return this.candidatesService.search(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.candidatesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(updateCandidateSchema))
    updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.candidatesService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.candidatesService.remove(id);
  }
}
