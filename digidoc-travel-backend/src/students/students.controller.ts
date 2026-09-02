import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { StudentsService } from './students.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { AssignAdvisorDto } from './dto/assign-advisor.dto.js';
import { CreateObservationDto } from './dto/create-observation.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AuditService } from '../audit/audit.service.js';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService, private readonly auditService: AuditService) {}

  @Post()
  @Roles('admin', 'supervisor', 'consultor')
  async create(@Body() dto: CreateStudentDto, @Req() req: any) {
    const student = await this.studentsService.create(dto);
    await this.auditService.log({ userId: req.user.id, action: 'CREATE', module: 'students', ip: req.ip, device: req.headers['user-agent'] });
    return student;
  }

  @Get()
  @Roles('admin', 'supervisor', 'consultor', 'asesor')
  async findAll(@Query() query: any) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'supervisor', 'consultor', 'asesor')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'supervisor', 'consultor')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentDto, @Req() req: any) {
    const student = await this.studentsService.update(id, dto);
    await this.auditService.log({ userId: req.user.id, action: 'UPDATE', module: 'students', ip: req.ip, device: req.headers['user-agent'] });
    return student;
  }

  @Delete(':id')
  @Roles('admin', 'supervisor')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    await this.studentsService.remove(id);
    await this.auditService.log({ userId: req.user.id, action: 'DELETE', module: 'students', ip: req.ip, device: req.headers['user-agent'] });
    return { message: 'Student deactivated' };
  }

  @Post(':id/advisor')
  @Roles('admin', 'supervisor')
  async assignAdvisor(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignAdvisorDto, @Req() req: any) {
    const student = await this.studentsService.assignAdvisor(id, dto.advisorId);
    await this.auditService.log({ userId: req.user.id, action: 'ASSIGN_ADVISOR', module: 'students', ip: req.ip, device: req.headers['user-agent'] });
    return student;
  }

  @Post(':id/observations')
  @Roles('admin', 'supervisor', 'consultor')
  async addObs(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateObservationDto, @Req() req: any) {
    return this.studentsService.addObservation(id, req.user.id, dto.observation);
  }

  @Get(':id/observations')
  @Roles('admin', 'supervisor', 'consultor', 'asesor')
  async getObs(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.getObservations(id);
  }
}
