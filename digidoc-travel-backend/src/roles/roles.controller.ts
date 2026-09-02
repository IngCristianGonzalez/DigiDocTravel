import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    // simple find by id via findByIds
    const roles = await this.rolesService.findByIds([id]);
    return roles[0] || null;
  }

  @Post()
  @Roles('admin')
  async create(@Body() dto: any) {
    return this.rolesService.create(dto);
  }
}
