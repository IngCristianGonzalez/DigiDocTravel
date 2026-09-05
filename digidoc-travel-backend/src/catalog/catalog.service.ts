import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity.js';
import { University } from './entities/university.entity.js';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Country) private readonly countryRepo: Repository<Country>,
  ) {}

  findAll(): Promise<Country[]> {
    return this.countryRepo.find({
      relations: { universities: true },
      order: { name: 'ASC', universities: { name: 'ASC' } },
    });
  }

  async findUniversities(codeOrName: string): Promise<University[]> {
    const country = await this.countryRepo.findOne({
      where: [{ code: codeOrName }, { name: codeOrName }],
      relations: { universities: true },
    });
    if (!country) throw new NotFoundException('Country not found');
    return [...(country.universities ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  }
}
