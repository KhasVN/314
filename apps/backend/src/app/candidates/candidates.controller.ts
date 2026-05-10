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
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  candidateSearchQuerySchema,
  createCandidateSchema,
  type CandidateSearchQueryDto,
} from '@talent-matching/dtos';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { getSessionUserFromHeaders } from '../auth/session-user';
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

  @Get('me')
  async getMine(@Req() req: Request) {
    const user = await getSessionUserFromHeaders(req.headers);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.candidatesService.findByUserId(user.id);
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
