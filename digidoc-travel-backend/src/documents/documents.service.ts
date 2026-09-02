import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity.js';
import { DocumentHistory } from './entities/document-history.entity.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { isAllowedUrl, hasValidMagicBytes } from '../security/helpers/ssrf.helper.js';
import { logSecurityEvent } from '../security/logger/winston.logger.js';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private readonly docRepo: Repository<Document>,
    @InjectRepository(DocumentHistory) private readonly historyRepo: Repository<DocumentHistory>,
  ) {}

  async create(dto: CreateDocumentDto, userId: string): Promise<Document> {
    // OWASP A10 - SSRF: validate fileUrl if provided
    if (dto.fileUrl && !isAllowedUrl(dto.fileUrl)) {
      logSecurityEvent('SSRF_BLOCKED', { fileUrl: dto.fileUrl, userId });
      throw new BadRequestException('Invalid file URL');
    }
    // OWASP A03/A10 - Path traversal & injection: sanitize name
    if (dto.name) {
      if (dto.name.includes('..') || dto.name.includes('/') || dto.name.includes('\\')) {
        throw new BadRequestException('Invalid file name');
      }
      dto.name = dto.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
    }
    if (dto.fileSize && dto.fileSize > 10 * 1024 * 1024) throw new BadRequestException('File size exceeds 10MB');
    if (dto.fileType && !['pdf', 'jpg', 'jpeg', 'png'].includes(dto.fileType.toLowerCase())) throw new BadRequestException('Invalid file type');
    const doc = this.docRepo.create({
      ...dto,
      uploadedBy: userId,
      fileUrl: dto.fileUrl || `https://s3.mock/${Date.now()}-${dto.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
    } as any);
    const saved = await this.docRepo.save(doc as any) as unknown as Document;
    await this.historyRepo.save(this.historyRepo.create({ documentId: (saved as any).id, userId, action: 'CREATE', changes: dto } as any) as any);
    return saved as Document;
  }

  async upload(file: any): Promise<{ fileUrl: string; fileSize: number; fileType: string }> {
    if (!file) throw new BadRequestException('No file provided');
    if (file.size > 10 * 1024 * 1024) throw new BadRequestException('File exceeds 10MB');
    // OWASP A10 - Validate mimetype vs extension and magic bytes
    const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) throw new BadRequestException('Invalid file type. Allowed: pdf, jpg, png');
    const allowedMime = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (file.mimetype && !allowedMime.includes(file.mimetype)) {
      logSecurityEvent('UPLOAD_INVALID_MIMETYPE', { mimetype: file.mimetype, originalname: file.originalname });
      throw new BadRequestException('Invalid mimetype');
    }
    if (file.buffer && file.mimetype && !hasValidMagicBytes(file.buffer, file.mimetype)) {
      logSecurityEvent('UPLOAD_MAGIC_BYTES_FAIL', { mimetype: file.mimetype });
      throw new BadRequestException('File content does not match type');
    }
    // OWASP A03 - Prevent path traversal in filename
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.\./g, '_');
    const fileUrl = `https://s3.mock/${Date.now()}-${sanitized}`;
    if (!isAllowedUrl(fileUrl)) throw new BadRequestException('Generated URL not allowed');
    return { fileUrl, fileSize: file.size, fileType: ext };
  }

  async findAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const qb = this.docRepo.createQueryBuilder('doc')
      .leftJoinAndSelect('doc.student', 'student');
    if (query.search) qb.andWhere('(doc.name ILIKE :search OR doc.type ILIKE :search)', { search: `%${query.search}%` });
    if (query.type) qb.andWhere('doc.type = :type', { type: query.type });
    if (query.studentId) qb.andWhere('doc.studentId = :sid', { sid: query.studentId });
    if (query.category) qb.andWhere('doc.category = :cat', { cat: query.category });
    if (query.status) qb.andWhere('doc.status = :status', { status: query.status });
    qb.orderBy('doc.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Document> {
    const doc = await this.docRepo.findOne({ where: { id }, relations: { student: true, history: true } as any });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(id: string, dto: UpdateDocumentDto, userId: string): Promise<Document> {
    const doc = await this.findOne(id);
    const before = { ...doc };
    Object.assign(doc, dto);
    const saved = await this.docRepo.save(doc as any) as unknown as Document;
    await this.historyRepo.save(this.historyRepo.create({ documentId: id, userId, action: 'UPDATE', changes: { before, after: dto } } as any) as any);
    return saved as Document;
  }

  async remove(id: string, userId: string): Promise<void> {
    const doc = await this.findOne(id);
    await this.historyRepo.save(this.historyRepo.create({ documentId: id, userId, action: 'DELETE', changes: null } as any) as any);
    await this.docRepo.remove(doc);
  }

  async getDownloadUrl(id: string): Promise<{ url: string; expiresIn: string }> {
    const doc = await this.findOne(id);
    // Mock presigned URL 1h
    const url = `${doc.fileUrl}?expires=${Date.now() + 3600000}&signature=mock`;
    return { url, expiresIn: '1h' };
  }

  async getHistory(id: string): Promise<DocumentHistory[]> {
    await this.findOne(id);
    return this.historyRepo.find({ where: { documentId: id }, order: { createdAt: 'DESC' } });
  }
}
