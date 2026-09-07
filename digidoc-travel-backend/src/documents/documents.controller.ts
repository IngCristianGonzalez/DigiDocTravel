import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { DocumentsService } from './documents.service.js';
import type {
  PaginationQuery,
  UploadedFile as UploadedFileType,
} from './documents.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly docsService: DocumentsService) {}

  @Post('upload')
  @Roles('admin', 'consultor')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: UploadedFileType | undefined) {
    return this.docsService.upload(file);
  }

  @Post()
  @Roles('admin', 'consultor')
  async create(
    @Body() dto: CreateDocumentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.docsService.create(dto, req.user.id);
  }

  @Get()
  async findAll(@Query() query: PaginationQuery) {
    return this.docsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.docsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'consultor')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.docsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('admin', 'consultor')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.docsService.remove(id, req.user.id);
    return { message: 'Document deleted' };
  }

  @Get(':id/download')
  async download(@Param('id', ParseUUIDPipe) id: string) {
    return this.docsService.getDownloadUrl(id);
  }

  @Get(':id/history')
  @Roles('admin', 'consultor')
  async history(@Param('id', ParseUUIDPipe) id: string) {
    return this.docsService.getHistory(id);
  }
}
