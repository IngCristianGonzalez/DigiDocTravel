import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity.js';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private readonly repo: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.repo.find({ order: { module: 'ASC' } });
  }

  async create(dto: Partial<Permission>): Promise<Permission> {
    const perm = this.repo.create(dto);
    return this.repo.save(perm);
  }
}
