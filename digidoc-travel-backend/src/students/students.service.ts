import { Injectable, NotFoundException, ConflictException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { Student } from './entities/student.entity.js';
import { StudentObservation } from './entities/student-observation.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';

export const ADVISOR_ROLES = ['asesor', 'consultor'] as const;

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(StudentObservation) private readonly obsRepo: Repository<StudentObservation>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const existingEmail = await this.studentRepo.findOne({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException('Student email already exists');
    const existingId = await this.studentRepo.findOne({ where: { identification: dto.identification } });
    if (existingId) throw new ConflictException('Student identification already exists');
    const student = this.studentRepo.create(dto as any) as unknown as Student;
    return this.studentRepo.save(student as any) as Promise<Student>;
  }

  async findAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const qb = this.studentRepo.createQueryBuilder('student')
      .leftJoinAndSelect('student.advisor', 'advisor');

    if (query.search) qb.andWhere('(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.email ILIKE :search OR student.identification ILIKE :search)', { search: `%${query.search}%` });
    if (query.countryOrigin) qb.andWhere('student.countryOrigin = :country', { country: query.countryOrigin });
    // Por defecto el listado solo trae activos; 'all' muestra todos, 'false' solo inactivos
    if (query.status === undefined || query.status === '' || query.status === 'all') {
      if (query.status !== 'all') qb.andWhere('student.status = :status', { status: true });
    } else {
      qb.andWhere('student.status = :status', { status: query.status === 'true' || query.status === true });
    }
    if (query.advisorId) qb.andWhere('student.advisorId = :advisorId', { advisorId: query.advisorId });

    qb.orderBy('student.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepo.findOne({ where: { id }, relations: { advisor: true, observations: true } as any });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    if (dto.email && dto.email !== student.email) {
      const existing = await this.studentRepo.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email already exists');
    }
    if (dto.identification && dto.identification !== student.identification) {
      const existing = await this.studentRepo.findOne({ where: { identification: dto.identification } });
      if (existing) throw new ConflictException('Identification already exists');
    }
    Object.assign(student, dto);
    return this.studentRepo.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    student.status = false;
    await this.studentRepo.save(student);
  }

  async getEligibleAdvisors(): Promise<Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>[]> {
    const advisors = await this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.status = :status', { status: true })
      .andWhere('role.name IN (:...roles)', { roles: [...ADVISOR_ROLES] })
      .orderBy('user.firstName', 'ASC')
      .addOrderBy('user.lastName', 'ASC')
      .getMany();
    return advisors.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email } as any));
  }

  async assignAdvisor(id: string, advisorId: string): Promise<Student> {
    if (!isUUID(advisorId)) throw new BadRequestException('advisorId must be a valid UUID');
    const advisor = await this.userRepo.findOne({ where: { id: advisorId } } as any);
    if (!advisor) throw new NotFoundException('Advisor user not found');
    // roles eager; ensure loaded
    const roles: string[] = (advisor as any).roles?.map((r: any) => r.name) ?? [];
    const hasEligibleRole = roles.some(r => (ADVISOR_ROLES as readonly string[]).includes(r));
    if (!hasEligibleRole) throw new UnprocessableEntityException('User is not an eligible advisor (requires asesor/consultor role)');
    if ((advisor as any).status === false) throw new UnprocessableEntityException('Advisor is deactivated');

    const student = await this.findOne(id);
    student.advisorId = advisorId;
    return this.studentRepo.save(student);
  }

  async addObservation(studentId: string, userId: string, observation: string): Promise<StudentObservation> {
    await this.findOne(studentId);
    const obs = this.obsRepo.create({ studentId, userId, observation } as any) as unknown as StudentObservation;
    return this.obsRepo.save(obs as any) as Promise<StudentObservation>;
  }

  async getObservations(studentId: string): Promise<StudentObservation[]> {
    await this.findOne(studentId);
    return this.obsRepo.find({ where: { studentId }, order: { createdAt: 'DESC' }, relations: { author: true } as any });
  }
}
