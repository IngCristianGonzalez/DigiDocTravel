import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity.js';

@Injectable()
export class PermissionsService {
  constructor(@InjectRepository(Permission) private readonly repo: Repository<Permission>) {}

  async findAll(): Promise<Permission[]> {
    return this.repo.find({ order: { module: 'ASC' } as any });
  }

  async create(dto: Partial<Permission>): Promise<Permission> {
    const perm = this.repo.create(dto as any);
    return this.repo.save(perm as any) as Promise<Permission>;
  }
}
