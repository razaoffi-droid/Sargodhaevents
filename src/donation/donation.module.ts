import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from './entities/donation.entity';
import { Donor } from 'src/donor/entities/donor.entity';
import { DonationsController } from './donation.controller';
import { DonationsService } from './donation.service';


@Module({
  imports: [TypeOrmModule.forFeature([Donation, Donor])],
  controllers: [DonationsController],
  providers: [DonationsService],
})
export class DonationsModule {}
