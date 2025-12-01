import { Controller, Get, Post, Body } from '@nestjs/common';
import { DonorService } from './donor.service';
import { Donor } from './entities/donor.entity';
// import { Donor } from './donor.entity';

@Controller('donor')
export class DonorController {
  constructor(private readonly donorService: DonorService) {}

  @Post()
  create(@Body() body: Partial<Donor>) {
    return this.donorService.create(body);
  }

  @Get()
  findAll() {
    return this.donorService.findAll();
  }
}
