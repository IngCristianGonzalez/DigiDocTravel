import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashService: DashboardService) {}

  @Get('summary')
  async summary() { return this.dashService.getSummary(); }

  @Get('students')
  async students() { return this.dashService.getStudentsStats(); }

  @Get('documents')
  async docs() { return this.dashService.getPendingDocuments(); }

  @Get('visas')
  async visas() { return this.dashService.getExpiringVisas(); }

  @Get('payments')
  async payments() { return this.dashService.getPendingPayments(); }

  @Get('events')
  async events() { return this.dashService.getUpcomingEvents(); }
}
