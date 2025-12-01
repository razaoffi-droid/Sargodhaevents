import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDonationDto } from './dto/create-donation.dto';
import { Donation } from './entities/donation.entity';
import { Donor } from 'src/donor/entities/donor.entity';


@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepo: Repository<Donation>,
    @InjectRepository(Donor)
    private donorRepo: Repository<Donor>,
  ) {}

  /**
   * Create donation. If donor exists (by contactNo) reuse it, otherwise create.
   */
  async create(createDto: CreateDonationDto): Promise<Donation> {
    const { donor: donorDto, ...donationData } = createDto;

    let donor: Donor | null = null;
    if (donorDto.contactNo) {
      donor = await this.donorRepo.findOne({ where: { contactNo: donorDto.contactNo } });
    }

    // If not found by contactNo, try to match by name + institute (optional)
    if (!donor && donorDto.name) {
      donor = await this.donorRepo.findOne({ where: { name: donorDto.name } });
    }

    if (!donor) {
      donor = this.donorRepo.create({
        name: donorDto.name,
        occupation: donorDto.occupation,
        donorType: donorDto.donorType,
        contactNo: donorDto.contactNo,
        instituteOrganization: donorDto.instituteOrganization,
      });
      donor = await this.donorRepo.save(donor);
    } else {
      // optionally update donor fields if provided
      let needsSave = false;
      if (donorDto.occupation && donor.occupation !== donorDto.occupation) {
        donor.occupation = donorDto.occupation;
        needsSave = true;
      }
      if (donorDto.donorType && donor.donorType !== donorDto.donorType) {
        donor.donorType = donorDto.donorType;
        needsSave = true;
      }
      if (donorDto.instituteOrganization && donor.instituteOrganization !== donorDto.instituteOrganization) {
        donor.instituteOrganization = donorDto.instituteOrganization;
        needsSave = true;
      }
      if (needsSave) await this.donorRepo.save(donor);
    }

    const donation = this.donationRepo.create({
      ...donationData,
      donor,
    });

    return this.donationRepo.save(donation);
  }

  async findAll(): Promise<Donation[]> {
    // donor is eager loaded, but if not you can join
    return this.donationRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Return aggregated totals for a specific machine (group key).
   * If `required` is provided the response will include `totalRequired` and `remaining`.
   */
  async getMachineSummary(machine: string, required?: number) {
    // Case-insensitive matching for machine names and safe aggregation
    const qb = this.donationRepo
      .createQueryBuilder('donation')
      .select('COALESCE(SUM(donation.amount), 0)', 'totalCollected')
      .where('LOWER(donation.donationFor) = LOWER(:machine)', { machine });

    const raw = await qb.getRawOne();
    const totalCollected = raw && raw.totalCollected ? Number(raw.totalCollected) : 0;
    const totalRequired = typeof required === 'number' && !Number.isNaN(required) ? required : null;
    const remaining = totalRequired !== null ? totalRequired - totalCollected : null;

    return {
      machine,
      totalRequired,
      totalCollected,
      remaining,
    };
  }

}
