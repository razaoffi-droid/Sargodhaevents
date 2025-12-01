import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';   // ✅ ADD THIS
import { Donor } from './donor/entities/donor.entity';
import { Donation } from './donation/entities/donation.entity';
import { DonationsModule } from './donation/donation.module';
import { DonorModule } from './donor/donor.module';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'donations_db',
      entities: [Donor, Donation],
      synchronize: true,
      logging: false,
    }),
    DonationsModule,
    DonorModule,
  ],
})
export class AppModule {}
