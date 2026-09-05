import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity.js';
import { University } from './entities/university.entity.js';
import { COUNTRY_SEED } from './catalog.seed-data.js';

// Seed idempotente: solo puebla si la tabla countries está vacía.
@Injectable()
export class CatalogSeeder implements OnModuleInit {
  private readonly logger = new Logger(CatalogSeeder.name);

  constructor(
    @InjectRepository(Country) private readonly countryRepo: Repository<Country>,
    @InjectRepository(University) private readonly universityRepo: Repository<University>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.countryRepo.count();
    if (count > 0) return;

    for (const seed of COUNTRY_SEED) {
      const country = await this.countryRepo.save(
        this.countryRepo.create({
          code: seed.code,
          name: seed.name,
          dialCode: seed.dialCode,
          flag: seed.flag,
        }),
      );
      if (seed.universities.length > 0) {
        await this.universityRepo.save(
          seed.universities.map((name) => this.universityRepo.create({ name, country })),
        );
      }
    }
    this.logger.log(`Catalog seeded: ${COUNTRY_SEED.length} countries`);
  }
}
