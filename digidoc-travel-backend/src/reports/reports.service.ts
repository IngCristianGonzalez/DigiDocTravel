import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity.js';
import { Document } from '../documents/entities/document.entity.js';
import { Visa } from '../visas/entities/visa.entity.js';
import { Installment } from '../payments/entities/installment.entity.js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(Document) private readonly docRepo: Repository<Document>,
    @InjectRepository(Visa) private readonly visaRepo: Repository<Visa>,
    @InjectRepository(Installment) private readonly instRepo: Repository<Installment>,
  ) {}

  async studentsReport(query: any) {
    const qb = this.studentRepo.createQueryBuilder('s');
    if (query.country) qb.andWhere('s.countryOrigin = :c', { c: query.country });
    if (query.status) qb.andWhere('s.status = :s', { s: query.status === 'true' });
    const data = await qb.getMany();
    return { total: data.length, data, generatedAt: new Date() };
  }

  async documentsReport(query: any) {
    const qb = this.docRepo.createQueryBuilder('d').leftJoinAndSelect('d.student', 's');
    if (query.type) qb.andWhere('d.type = :t', { t: query.type });
    if (query.status) qb.andWhere('d.status = :s', { s: query.status });
    const data = await qb.getMany();
    return { total: data.length, data, generatedAt: new Date() };
  }

  async visasReport(query: any) {
    const threshold = new Date(); threshold.setDate(threshold.getDate() + 90);
    const qb = this.visaRepo.createQueryBuilder('v').leftJoinAndSelect('v.student', 's');
    if (query.expiring === 'true') {
      qb.where('v.expiryDate <= :t', { t: threshold.toISOString().split('T')[0] }).andWhere('v.expiryDate >= :now', { now: new Date().toISOString().split('T')[0] });
    }
    const data = await qb.getMany();
    return { total: data.length, data, generatedAt: new Date() };
  }

  async paymentsReport(query: any) {
    const qb = this.instRepo.createQueryBuilder('i').leftJoinAndSelect('i.plan', 'plan').leftJoinAndSelect('plan.student', 's');
    if (query.status) qb.andWhere('i.status = :s', { s: query.status });
    if (query.pending === 'true') qb.andWhere('i.status = :p', { p: 'pending' });
    const data = await qb.getMany();
    const totalAmount = data.reduce((sum, i) => sum + parseFloat(String(i.amount)), 0);
    return { total: data.length, totalAmount, data, generatedAt: new Date() };
  }

  async exportReport(type: string, format: 'pdf' | 'excel', query: any) {
    let data: any;
    switch (type) {
      case 'students': data = await this.studentsReport(query); break;
      case 'documents': data = await this.documentsReport(query); break;
      case 'visas': data = await this.visasReport(query); break;
      case 'payments': data = await this.paymentsReport(query); break;
      default: throw new Error('Invalid report type');
    }
    if (format === 'pdf') {
      return { format: 'pdf', contentType: 'application/pdf', filename: `${type}-report.pdf`, data };
    } else {
      return { format: 'excel', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `${type}-report.xlsx`, data };
    }
  }
}
