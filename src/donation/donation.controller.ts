import { Body, Controller, Get, Post, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CreateDonationDto } from './dto/create-donation.dto';
import { DonationsService } from './donation.service';
import { Donation } from './entities/donation.entity';


@Controller('donations')
export class DonationsController {
  constructor(private readonly svc: DonationsService) {}

  @Post()
  async create(@Body() dto: CreateDonationDto): Promise<Donation> {
    console.log('POST /donations payload:', JSON.stringify(dto));
    try {
      const result = await this.svc.create(dto);
      console.log('Donation created, id=', result?.id);
      return result;
    } catch (err) {
      console.error('Error in DonationsController.create:', err?.message || err);
      throw new HttpException(err?.message || 'Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getAll(): Promise<Donation[]> {
    return this.svc.findAll();
  }

  @Get('summary')
  async getMachineSummary(
    @Query('machine') machine?: string,
    @Query('required') required?: string,
  ) {
    if (!machine) {
      return {
        error: 'Query parameter `machine` is required. Example: /donations/summary?machine=ECG-1&required=10000',
      };
    }

    const requiredAmount = required !== undefined && required !== '' ? Number(required) : undefined;
    return this.svc.getMachineSummary(machine, requiredAmount);
  }


 // total summary of all machines
@Get('machines-summary')
getMachinesSummary() {
  return this.svc.getMachinesSummary();
}

}

