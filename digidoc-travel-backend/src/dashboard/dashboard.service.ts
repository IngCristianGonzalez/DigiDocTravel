import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity.js';
import { Document } from '../documents/entities/document.entity.js';
import { Visa } from '../visas/entities/visa.entity.js';
import { Installment } from '../payments/entities/installment.entity.js';
import { Event } from '../events/entities/event.entity.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(Document) private readonly docRepo: Repository<Document>,
    @InjectRepository(Visa) private readonly visaRepo: Repository<Visa>,
    @InjectRepository(Installment) private readonly instRepo: Repository<Installment>,
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getSummary() {
    const totalStudents = await this.studentRepo.count();
    const activeStudents = await this.studentRepo.count({ where: { status: true } });
    const totalDocs = await this.docRepo.count();
    const pendingDocs = await this.docRepo.count({ where: { status: 'pending' } });
    const totalUsers = await this.userRepo.count();

    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 90);
    const expiringVisas = await this.visaRepo.createQueryBuilder('v')
      .where('v.expiryDate <= :threshold', { threshold: threshold.toISOString().split('T')[0] })
      .andWhere('v.expiryDate >= :now', { now: new Date().toISOString().split('T')[0] })
      .getCount();
    const expiredVisas = await this.visaRepo.createQueryBuilder('v').where('v.expiryDate < :now', { now: new Date().toISOString().split('T')[0] }).getCount();

    const pendingPayments = await this.instRepo.count({ where: { status: 'pending' } });
    const overdue = await this.instRepo.createQueryBuilder('i').where('i.status = :s', { s: 'pending' }).andWhere('i.dueDate < :now', { now: new Date().toISOString().split('T')[0] }).getCount();
    const totalAmountRaw = await this.instRepo.createQueryBuilder('i').select('SUM(i.amount)', 'sum').where('i.status = :s', { s: 'pending' }).getRawOne();

    const in7days = new Date();
    in7days.setDate(in7days.getDate() + 7);
    const nextEvents = await this.eventRepo.createQueryBuilder('e').where('e.eventDate >= :now', { now: new Date() }).andWhere('e.eventDate <= :limit', { limit: in7days }).getCount();
    const totalEvents = await this.eventRepo.count();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const newThisMonth = await this.studentRepo.createQueryBuilder('s').where('s.createdAt >= :start', { start: startOfMonth }).getCount();

    return {
      students: { total: totalStudents, active: activeStudents, newThisMonth },
      documents: { total: totalDocs, pending: pendingDocs, expired: 0 },
      visas: { expiringIn90Days: expiringVisas, expired: expiredVisas },
      payments: { pending: pendingPayments, overdue, totalAmount: parseFloat(totalAmountRaw?.sum || 0) },
      events: { next7Days: nextEvents, total: totalEvents },
      users: { total: totalUsers },
    };
  }

  async getStudentsStats() {
    const total = await this.studentRepo.count();
    const active = await this.studentRepo.count({ where: { status: true } });
    const byCountry = await this.studentRepo.createQueryBuilder('s').select('s.countryOrigin', 'country').addSelect('COUNT(*)', 'count').groupBy('s.countryOrigin').getRawMany();
    return { total, active, byCountry };
  }

  async getPendingDocuments() {
    return this.docRepo.find({ where: { status: 'pending' }, take: 10, order: { createdAt: 'DESC' } });
  }

  async getExpiringVisas() {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + 90);
    return this.visaRepo.createQueryBuilder('v').leftJoinAndSelect('v.student', 's').where('v.expiryDate <= :t', { t: threshold.toISOString().split('T')[0] }).andWhere('v.expiryDate >= :now', { now: new Date().toISOString().split('T')[0] }).getMany();
  }

  async getPendingPayments() {
    return this.instRepo.find({ where: { status: 'pending' }, take: 10, order: { dueDate: 'ASC' } as any });
  }

  async getUpcomingEvents() {
    const in7days = new Date(); in7days.setDate(in7days.getDate() + 7);
    return this.eventRepo.createQueryBuilder('e').where('e.eventDate >= :now', { now: new Date() }).andWhere('e.eventDate <= :limit', { limit: in7days }).orderBy('e.eventDate', 'ASC').getMany();
  }
}
