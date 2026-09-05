import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity.js';
import { University } from './entities/university.entity.js';
import { CatalogService } from './catalog.service.js';
import { CatalogSeeder } from './catalog.seeder.js';
import { CatalogController } from './catalog.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Country, University])],
  controllers: [CatalogController],
  providers: [CatalogService, CatalogSeeder],
  exports: [CatalogService],
})
export class CatalogModule {}
