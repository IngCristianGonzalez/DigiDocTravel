import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visa } from './entities/visa.entity.js';
import { VisasService } from './visas.service.js';
import { VisasController } from './visas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Visa])],
  controllers: [VisasController],
  providers: [VisasService],
  exports: [VisasService],
})
export class VisasModule {}
