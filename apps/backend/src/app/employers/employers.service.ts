import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { employerProfiles } from '../../db/domain-schema';
import { DatabaseService } from '../database/database.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';

@Injectable()
export class EmployersService {
  constructor(private readonly database: DatabaseService) {}

  async create(createEmployerDto: CreateEmployerDto) {
    const [employer] = await this.database.db
      .insert(employerProfiles)
      .values({
        id: randomUUID(),
        userId: createEmployerDto.userId,
        companyName: createEmployerDto.companyName,
        companyInfo: createEmployerDto.companyInfo,
        contactInfo: createEmployerDto.contactInfo,
        isMember: createEmployerDto.isMember ?? false,
      })
      .returning();

    return employer;
  }

  findAll() {
    return this.database.db.select().from(employerProfiles);
  }

  async findOne(id: string) {
    const [employer] = await this.database.db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.id, id))
      .limit(1);

    if (!employer) {
      throw new NotFoundException('Employer not found');
    }

    return employer;
  }

  async update(id: string, updateEmployerDto: UpdateEmployerDto) {
    const [employer] = await this.database.db
      .update(employerProfiles)
      .set(updateEmployerDto)
      .where(eq(employerProfiles.id, id))
      .returning();

    if (!employer) {
      throw new NotFoundException('Employer not found');
    }

    return employer;
  }

  async remove(id: string) {
    const [employer] = await this.database.db
      .delete(employerProfiles)
      .where(eq(employerProfiles.id, id))
      .returning();

    if (!employer) {
      throw new NotFoundException('Employer not found');
    }

    return employer;
  }
}
