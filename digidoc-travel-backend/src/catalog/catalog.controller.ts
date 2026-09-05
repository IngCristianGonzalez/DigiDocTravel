import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('countries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @Roles('admin', 'supervisor', 'consultor', 'asesor')
  findAll() {
    return this.catalogService.findAll();
  }

  @Get(':code/universities')
  @Roles('admin', 'supervisor', 'consultor', 'asesor')
  findUniversities(@Param('code') code: string) {
    return this.catalogService.findUniversities(code);
  }
}
