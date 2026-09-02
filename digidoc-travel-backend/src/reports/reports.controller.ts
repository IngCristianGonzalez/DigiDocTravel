import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { Response } from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('students')
  @Roles('admin', 'supervisor')
  async students(@Query() query: any) { return this.reportsService.studentsReport(query); }

  @Get('documents')
  @Roles('admin', 'supervisor')
  async documents(@Query() query: any) { return this.reportsService.documentsReport(query); }

  @Get('visas')
  @Roles('admin', 'supervisor')
  async visas(@Query() query: any) { return this.reportsService.visasReport(query); }

  @Get('payments')
  @Roles('admin', 'supervisor')
  async payments(@Query() query: any) { return this.reportsService.paymentsReport(query); }

  @Get('export/:type')
  @Roles('admin', 'supervisor')
  async exportReport(@Param('type') type: string, @Query('format') format: string, @Query() query: any, @Res() res: Response) {
    const result = await this.reportsService.exportReport(type, (format as any) || 'pdf', query);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${result.filename}`);
    return res.json(result);
  }
}
