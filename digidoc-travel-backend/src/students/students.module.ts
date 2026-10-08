import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity.js';
import { StudentObservation } from './entities/student-observation.entity.js';
import { User } from '../users/entities/user.entity.js';
import { StudentsService } from './students.service.js';
import { StudentsController } from './students.controller.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Student, StudentObservation, User]), AuditModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
