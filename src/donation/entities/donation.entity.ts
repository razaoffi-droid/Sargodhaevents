import { Donor } from 'src/donor/entities/donor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import { Donor } from './donor.entity';

@Entity('donation')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  donationFor?: string; // e.g., Equipment

  @Column({ nullable: true })
  donationType?: string; // Cash / Pledge

  @Column({ nullable: true })
  methodMode?: string; // Method / Mode

  @Column({ type: 'numeric', nullable: true })
  amount?: number;

  @Column({ nullable: true })
  pledgeDate?: string; // ISO date or string

  @Column({ nullable: true })
  remarks?: string;

  @ManyToOne(() => Donor, (donor) => donor.donations, { eager: true })
  donor: Donor;

  @CreateDateColumn()
  createdAt: Date;
}
