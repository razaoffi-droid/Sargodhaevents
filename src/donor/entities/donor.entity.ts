import { Donation } from 'src/donation/entities/donation.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
// import { Donation } from './donation.entity';

@Entity('donor')
@Unique(['contactNo'])
export class Donor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  occupation?: string;

  @Column({ nullable: true })
  donorType?: string; // Individual, Corporate, etc.

  @Column({ nullable: true })
  contactNo?: string;

  @Column({ nullable: true })
  instituteOrganization?: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Donation, (donation) => donation.donor)
  donations: Donation[];
}
