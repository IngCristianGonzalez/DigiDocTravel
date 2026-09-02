import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permService: PermissionsService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    return this.permService.findAll();
  }

  @Post()
  @Roles('admin')
  async create(@Body() dto: any) {
    return this.permService.create(dto);
  }
}
