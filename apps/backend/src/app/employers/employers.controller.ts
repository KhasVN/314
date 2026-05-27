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
import { createEmployerSchema } from '@talent-matching/dtos';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { EmployersService } from './employers.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';
import { updateEmployerSchema } from './dto/update-employer.dto';

@Controller('employers')
export class EmployersController {
  constructor(private readonly employersService: EmployersService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createEmployerSchema))
    createEmployerDto: CreateEmployerDto,
  ) {
    return this.employersService.create(createEmployerDto);
  }

  // ── GET /api/employers → list all employers ──────────────
  // ── GET /api/employers?search=query → search by name/job ─
  @Get()
  findAll(@Query('search') search?: string) {
    if (search) return this.employersService.search(search);
    return this.employersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.employersService.findOne(id);
  }

  // ── GET /api/employers/:id/jobs → jobs by this employer ──
  @Get(':id/jobs')
  findJobs(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.employersService.findJobs(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(updateEmployerSchema))
    updateEmployerDto: UpdateEmployerDto,
  ) {
    return this.employersService.update(id, updateEmployerDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.employersService.remove(id);
  }
}
