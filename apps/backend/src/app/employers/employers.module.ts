import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EmployersService } from './employers.service';
import { EmployersController } from './employers.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployersController],
  providers: [EmployersService],
})
export class EmployersModule {}
