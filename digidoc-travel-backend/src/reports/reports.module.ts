import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity.js';
import { Document } from '../documents/entities/document.entity.js';
import { Visa } from '../visas/entities/visa.entity.js';
import { Installment } from '../payments/entities/installment.entity.js';
import { ReportsService } from './reports.service.js';
import { ReportsController } from './reports.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Document, Visa, Installment])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
