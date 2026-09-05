import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { Country } from './country.entity.js';

@Entity('universities')
export class University {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @ManyToOne(() => Country, (c) => c.universities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @RelationId((u: University) => u.country)
  countryId: string;
}
