import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { StudentObservation } from './student-observation.entity.js';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100 })
  countryOrigin: string;

  @Column({ length: 100, nullable: true })
  cityOrigin: string;

  @Column({ length: 200, nullable: true })
  university: string;

  @Column({ length: 200, nullable: true })
  career: string;

  @Column({ type: 'int', nullable: true })
  semester: number;

  @Column({ default: true })
  status: boolean;

  @Column({ type: 'uuid', nullable: true })
  advisorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'advisor_id' })
  advisor: User;

  @OneToMany(() => StudentObservation, obs => obs.student, { cascade: true })
  observations: StudentObservation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
