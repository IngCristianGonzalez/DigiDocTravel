import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity.js';
import { EventParticipant } from './entities/event-participant.entity.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { randomUUID } from 'crypto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(EventParticipant) private readonly partRepo: Repository<EventParticipant>,
  ) {}

  private generateQrAndLink(): { qrCode: string; uniqueLink: string } {
    const link = randomUUID();
    const qrCode = `data:image/png;base64,${Buffer.from(`https://digidoc.travel/events/${link}`).toString('base64')}`;
    return { qrCode, uniqueLink: link };
  }

  async create(dto: CreateEventDto, userId: string): Promise<Event> {
    const { qrCode, uniqueLink } = this.generateQrAndLink();
    const event = this.eventRepo.create({
      title: dto.title,
      description: dto.description,
      eventDate: new Date(dto.eventDate),
      location: dto.location,
      qrCode,
      uniqueLink,
      createdBy: userId,
    } as any);
    const saved = await this.eventRepo.save(event as any) as unknown as Event;
    if (dto.participantIds && dto.participantIds.length > 0) {
      const participants = dto.participantIds.map(sid => this.partRepo.create({ eventId: saved.id, studentId: sid } as any));
      await this.partRepo.save(participants as any);
    }
    return this.findOne((saved as any).id);
  }

  async findAll(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const qb = this.eventRepo.createQueryBuilder('event').leftJoinAndSelect('event.participants', 'p').leftJoinAndSelect('p.student', 's');
    if (query.search) qb.andWhere('(event.title ILIKE :s OR event.description ILIKE :s)', { s: `%${query.search}%` });
    if (query.upcoming === 'true') qb.andWhere('event.eventDate >= :now', { now: new Date() });
    qb.orderBy('event.eventDate', 'ASC');
    qb.skip((page-1)*limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total/limit) };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepo.findOne({ where: { id }, relations: { participants: { student: true } } as any });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findByLink(link: string): Promise<Event> {
    const event = await this.eventRepo.findOne({ where: { uniqueLink: link }, relations: { participants: true } as any });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, { ...dto, eventDate: dto.eventDate ? new Date(dto.eventDate) : event.eventDate });
    return this.eventRepo.save(event);
  }

  async getQr(id: string): Promise<{ qrCode: string; uniqueLink: string }> {
    const event = await this.findOne(id);
    return { qrCode: event.qrCode, uniqueLink: event.uniqueLink };
  }

  async checkReminders(): Promise<Event[]> {
    const in24h = new Date();
    in24h.setDate(in24h.getDate() + 1);
    const events = await this.eventRepo.createQueryBuilder('event')
      .where('event.eventDate <= :threshold', { threshold: in24h })
      .andWhere('event.eventDate >= :now', { now: new Date() })
      .andWhere('event.reminderSent = :sent', { sent: false })
      .getMany();
    for (const e of events) {
      e.reminderSent = true;
      await this.eventRepo.save(e);
    }
    return events;
  }
}
