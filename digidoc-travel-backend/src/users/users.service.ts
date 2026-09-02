import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity.js';
import { Role } from '../roles/entities/role.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    let roles: Role[] = [];
    if (dto.roleIds && dto.roleIds.length > 0) {
      roles = await this.roleRepository.find({ where: { id: In(dto.roleIds) } });
    }
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      roles,
    });
    return this.userRepository.save(user);
  }

  async findAll(query: QueryUserDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const qb = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission');

    if (query.email) qb.andWhere('user.email ILIKE :email', { email: `%${query.email}%` });
    if (query.search) qb.andWhere('(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)', { search: `%${query.search}%` });
    if (query.status !== undefined) qb.andWhere('user.status = :status', { status: query.status === 'true' });
    if (query.role) qb.andWhere('role.name = :role', { role: query.role });

    if (query.sortBy) {
      const order = query.sortOrder === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`user.${query.sortBy}`, order);
    } else {
      qb.orderBy('user.createdAt', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.email && dto.email !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing) throw new ConflictException('Email already exists');
    }
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user.status) throw new BadRequestException('User already deactivated');
    // prevent deactivating last admin
    const adminRole = await this.roleRepository.findOne({ where: { name: 'admin' } });
    if (adminRole && user.roles.some(r => r.name === 'admin')) {
      const adminCount = await this.userRepository.createQueryBuilder('user')
        .innerJoin('user.roles', 'role', 'role.name = :roleName', { roleName: 'admin' })
        .where('user.status = :status', { status: true })
        .getCount();
      if (adminCount <= 1) throw new BadRequestException('Cannot deactivate last admin');
    }
    user.status = false;
    return this.userRepository.save(user);
  }

  async assignRoles(id: string, roleIds: string[]): Promise<User> {
    const user = await this.findOne(id);
    const roles = await this.roleRepository.find({ where: { id: In(roleIds) } });
    if (roles.length !== roleIds.length) throw new NotFoundException('Some roles not found');
    user.roles = roles;
    return this.userRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLogin: new Date() });
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(id, { password: hashedPassword });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
