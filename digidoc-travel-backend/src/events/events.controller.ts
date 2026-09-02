import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('admin', 'consultor')
  async create(@Body() dto: CreateEventDto, @Req() req: any) {
    return this.eventsService.create(dto, req.user.id);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.eventsService.findAll(query);
  }

  @Get(':id/qr')
  async getQr(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.getQr(id);
  }

  @Get('link/:link')
  async byLink(@Param('link') link: string) {
    return this.eventsService.findByLink(link);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'consultor')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }
}
