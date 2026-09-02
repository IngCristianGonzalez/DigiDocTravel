import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private readonly notifRepo: Repository<Notification>) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notif = this.notifRepo.create(dto as any);
    const saved = await this.notifRepo.save(notif as any) as unknown as Notification;
    // mock email sending
    // await kafka emit notification.email
    return saved as Notification;
  }

  async findAll(userId: string, query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const qb = this.notifRepo.createQueryBuilder('n').where('n.userId = :uid', { uid: userId });
    if (query.type) qb.andWhere('n.type = :type', { type: query.type });
    if (query.read !== undefined) qb.andWhere('n.read = :read', { read: query.read === 'true' });
    qb.orderBy('n.createdAt', 'DESC');
    qb.skip((page-1)*limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total/limit) };
  }

  async countUnread(userId: string): Promise<{ count: number }> {
    const count = await this.notifRepo.count({ where: { userId, read: false } });
    return { count };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notif = await this.notifRepo.findOne({ where: { id, userId } });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.read = true;
    return this.notifRepo.save(notif);
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notifRepo.createQueryBuilder().update(Notification).set({ read: true }).where('userId = :uid AND read = :read', { uid: userId, read: false }).execute();
    return { updated: result.affected || 0 };
  }
}
