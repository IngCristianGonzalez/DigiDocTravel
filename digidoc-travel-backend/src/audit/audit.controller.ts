import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('user/:id')
  @Roles('admin', 'supervisor')
  async byUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditService.findByUser(id);
  }

  @Get()
  @Roles('admin')
  async all(@Query() query: any) {
    // simple passthrough to findByUser if userId provided else return recent
    if (query.userId) return this.auditService.findByUser(query.userId);
    return this.auditService.findRecent(query.limit ? parseInt(query.limit) : 100);
  }
}
