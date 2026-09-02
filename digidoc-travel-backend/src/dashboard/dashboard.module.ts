import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity.js';
import { Document } from '../documents/entities/document.entity.js';
import { Visa } from '../visas/entities/visa.entity.js';
import { Installment } from '../payments/entities/installment.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { User } from '../users/entities/user.entity.js';
import { DashboardService } from './dashboard.service.js';
import { DashboardController } from './dashboard.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Document, Visa, Installment, Event, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
