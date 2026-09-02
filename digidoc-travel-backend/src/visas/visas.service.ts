import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { Visa } from './entities/visa.entity.js';
import { CreateVisaDto } from './dto/create-visa.dto.js';
import { UpdateVisaDto } from './dto/update-visa.dto.js';

@Injectable()
export class VisasService {
  constructor(@InjectRepository(Visa) private readonly visaRepo: Repository<Visa>) {}

  private computeStatus(visa: Visa): string {
    const now = new Date();
    const expiry = new Date(visa.expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'expired';
    if (diffDays <= 90) return 'expiring_soon';
    return 'active';
  }

  async create(dto: CreateVisaDto, userId: string): Promise<Visa> {
    if (new Date(dto.expiryDate) <= new Date(dto.issueDate)) throw new BadRequestException('Expiry date must be after issue date');
    const visa = this.visaRepo.create({ ...dto, createdBy: userId } as any);
    const saved = await this.visaRepo.save(visa as any) as unknown as Visa;
    (saved as any).computedStatus = this.computeStatus(saved as any);
    (saved as any).daysLeft = Math.ceil((new Date((saved as any).expiryDate).getTime() - Date.now()) / (1000*60*60*24));
    return saved;
  }

  async findAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const qb = this.visaRepo.createQueryBuilder('visa').leftJoinAndSelect('visa.student', 'student');
    if (query.studentId) qb.andWhere('visa.studentId = :sid', { sid: query.studentId });
    if (query.status) qb.andWhere('visa.status = :status', { status: query.status });
    if (query.search) qb.andWhere('(visa.visaNumber ILIKE :s OR visa.visaType ILIKE :s)', { s: `%${query.search}%` });
    qb.orderBy('visa.expiryDate', 'ASC');
    qb.skip((page-1)*limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    const enriched = data.map(v => ({ ...v, computedStatus: this.computeStatus(v), daysLeft: Math.ceil((new Date(v.expiryDate).getTime() - Date.now())/(1000*60*60*24)) }));
    return { data: enriched, total, page, limit, totalPages: Math.ceil(total/limit) };
  }

  async findOne(id: string): Promise<any> {
    const visa = await this.visaRepo.findOne({ where: { id }, relations: { student: true } as any });
    if (!visa) throw new NotFoundException('Visa not found');
    return { ...visa, computedStatus: this.computeStatus(visa), daysLeft: Math.ceil((new Date(visa.expiryDate).getTime() - Date.now())/(1000*60*60*24)) };
  }

  async update(id: string, dto: UpdateVisaDto): Promise<Visa> {
    const visa = await this.visaRepo.findOne({ where: { id } });
    if (!visa) throw new NotFoundException('Visa not found');
    if (dto.issueDate && dto.expiryDate && new Date(dto.expiryDate) <= new Date(dto.issueDate)) throw new BadRequestException('Expiry must be after issue');
    Object.assign(visa, dto);
    return this.visaRepo.save(visa);
  }

  async findExpiring(days = 90) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);
    const visas = await this.visaRepo.createQueryBuilder('visa')
      .leftJoinAndSelect('visa.student', 'student')
      .where('visa.expiryDate <= :threshold', { threshold: threshold.toISOString().split('T')[0] })
      .andWhere('visa.expiryDate >= :now', { now: new Date().toISOString().split('T')[0] })
      .getMany();
    return visas.map(v => ({ ...v, computedStatus: this.computeStatus(v), daysLeft: Math.ceil((new Date(v.expiryDate).getTime() - Date.now())/(1000*60*60*24)) }));
  }

  async checkExpiringAndAlert(): Promise<Visa[]> {
    const expiring = await this.findExpiring(90);
    for (const visa of expiring) {
      if (!visa.alertSent) {
        visa.alertSent = true;
        await this.visaRepo.save(visa);
        // In production emit Kafka event visa.expiring and create notifications
      }
    }
    return expiring;
  }
}
