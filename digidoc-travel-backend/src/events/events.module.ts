import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity.js';
import { EventParticipant } from './entities/event-participant.entity.js';
import { EventsService } from './events.service.js';
import { EventsController } from './events.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventParticipant])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
