import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { AssignRolesDto } from './dto/assign-roles.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AuditService } from '../audit/audit.service.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly auditService: AuditService) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateUserDto, @Req() req: any) {
    const user = await this.usersService.create(dto);
    await this.auditService.log({ userId: req.user.id, action: 'CREATE', module: 'users', ip: req.ip, device: req.headers['user-agent'] });
    return user;
  }

  @Get()
  @Roles('admin', 'supervisor')
  async findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'supervisor')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    const user = await this.usersService.update(id, dto);
    await this.auditService.log({ userId: req.user.id, action: 'UPDATE', module: 'users', ip: req.ip, device: req.headers['user-agent'] });
    return user;
  }

  @Delete(':id')
  @Roles('admin')
  async deactivate(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const user = await this.usersService.deactivate(id);
    await this.auditService.log({ userId: req.user.id, action: 'DEACTIVATE', module: 'users', ip: req.ip, device: req.headers['user-agent'] });
    return user;
  }

  @Post(':id/roles')
  @Roles('admin')
  async assignRoles(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignRolesDto, @Req() req: any) {
    const user = await this.usersService.assignRoles(id, dto.roleIds);
    await this.auditService.log({ userId: req.user.id, action: 'ASSIGN_ROLES', module: 'users', ip: req.ip, device: req.headers['user-agent'] });
    return user;
  }
}
