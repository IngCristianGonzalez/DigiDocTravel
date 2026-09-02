import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity.js';
import { StudentObservation } from './entities/student-observation.entity.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(StudentObservation) private readonly obsRepo: Repository<StudentObservation>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const existing = await this.studentRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Student email already exists');
    const student = this.studentRepo.create(dto as any) as unknown as Student;
    return this.studentRepo.save(student as any) as Promise<Student>;
  }

  async findAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const qb = this.studentRepo.createQueryBuilder('student')
      .leftJoinAndSelect('student.advisor', 'advisor');

    if (query.search) qb.andWhere('(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.email ILIKE :search)', { search: `%${query.search}%` });
    if (query.countryOrigin) qb.andWhere('student.countryOrigin = :country', { country: query.countryOrigin });
    if (query.status !== undefined) qb.andWhere('student.status = :status', { status: query.status === 'true' || query.status === true });
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
    Object.assign(student, dto);
    return this.studentRepo.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    student.status = false;
    await this.studentRepo.save(student);
  }

  async assignAdvisor(id: string, advisorId: string): Promise<Student> {
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
