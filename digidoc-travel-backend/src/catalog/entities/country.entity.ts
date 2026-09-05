import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { University } from './university.entity.js';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10, unique: true })
  code: string;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 10 })
  dialCode: string;

  @Column({ length: 10, nullable: true })
  flag: string;

  @OneToMany(() => University, (u) => u.country, { cascade: true })
  universities: University[];

  @CreateDateColumn()
  createdAt: Date;
}
