import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity.js';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async log(data: {
    userId: string;
    action: string;
    module: string;
    ip?: string;
    device?: string;
  }): Promise<AuditLog> {
    const entry = this.auditRepository.create(data);
    return this.auditRepository.save(entry);
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    } as any);
  }

  async findRecent(limit = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    } as any);
  }
}
