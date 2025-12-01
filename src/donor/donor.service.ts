import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donor } from './entities/donor.entity';

@Injectable()
export class DonorService {
  constructor(
    @InjectRepository(Donor)
    private donorRepo: Repository<Donor>,
  ) {}

  create(data: Partial<Donor>) {
    const donor = this.donorRepo.create(data);
    return this.donorRepo.save(donor);
  }

  findAll() {
    return this.donorRepo.find();
  }
}
