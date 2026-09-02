import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { VisasService } from './visas.service.js';
import { CreateVisaDto } from './dto/create-visa.dto.js';
import { UpdateVisaDto } from './dto/update-visa.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('visas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisasController {
  constructor(private readonly visasService: VisasService) {}

  @Post()
  @Roles('admin', 'consultor')
  async create(@Body() dto: CreateVisaDto, @Req() req: any) {
    return this.visasService.create(dto, req.user.id);
  }

  @Get('expiring')
  async expiring(@Query('days') days?: string) {
    return this.visasService.findExpiring(days ? parseInt(days) : 90);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.visasService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.visasService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'consultor')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVisaDto) {
    return this.visasService.update(id, dto);
  }
}
