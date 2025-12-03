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


  //total donations summary


//   async getMachinesSummary() {
//   const requiredAmounts = {
//     "USG Machine Aplio-400 Platinum (Refurb)": 2000000,
//     "X-Ray Machine KXO-50R(Toshiba(Japan) 630MA)": 3500000,
//     "ECG 3 channel": 100000,
//     "OPG Verbview(Japan)": 2000000,
//     "CT Scan 64 slices Toshiba(Japan) with Accessores": 30000000,
//     "0.4 Tesla Hitachi MRI (Refurb)": 57500000,
//     "ECHO Machine-Paolus Plus(Japan)": 900000,
  
//   };

//   // get total collected for each machine
//   const donations = await this.donationRepo
//     .createQueryBuilder('donation')
//     .select('donation.donationFor', 'machine')
//     .addSelect('SUM(donation.amount)', 'totalCollected')
//     .groupBy('donation.donationFor')
//     .getRawMany();

//   let totalCollectedAll = 0;
//   let totalRequiredAll = 96000000; // sum of all required amounts

//   const machines = donations.map((item) => {
//     const machineName = item.machine?.toLowerCase();
//     const collected = Number(item.totalCollected) || 0;
//     const required = requiredAmounts[machineName] || 0;

//     totalCollectedAll += collected;
//     totalRequiredAll += required;

//     return {
//       machine: machineName,
//       collectedAmount: collected,
//       requiredAmount: required,
//       remainingAmount: required - collected,
//     };
//   });

//   return {
//     machines,
//     totalCollectedAll,
//     totalRequiredAll,
//     totalRemainingAll: totalRequiredAll - totalCollectedAll,
//   };
// }


async getMachinesSummary() {
  const requiredAmounts: Record<string, number> = {
    "usg machine aplio-400 platinum (refurb)": 2000000,
    "x-ray machine kxo-50r(toshiba(japan) 630ma": 3500000,
    "ecg 3 channel": 100000,
    "opg verbview(japan)": 2000000,
    "ct scan 64 slices toshiba(japan) with accessores": 30000000,
    "0.4 tesla hitachi mri (refurb)": 57500000,
    "echo machine-paolus plus(japan)": 900000,
  };
  const donations = await this.donationRepo
    .createQueryBuilder("donation")
    .select("donation.donationFor", "machine")
    .addSelect("SUM(donation.amount)", "totalCollected")
    .groupBy("donation.donationFor")
    .getRawMany();
  // :white_check_mark: Build lookup from donations
  const donationMap = new Map<string, number>();
  donations.forEach((item) => {
    const key = (item.machine || "").toLowerCase().trim();
    donationMap.set(key, Number(item.totalCollected) || 0);
  });
  let totalCollectedAll = 0;
  const totalRequiredAll = 96000000; // as per your logic
  // :white_check_mark: Iterate over ALL machines
  const machines = Object.entries(requiredAmounts).map(
    ([machineKey, required]) => {
      const collected = donationMap.get(machineKey) || 0;
      totalCollectedAll += collected;
      return {
        machine: machineKey, // same structure
        collectedAmount: collected,
        requiredAmount: required,
        remainingAmount: Math.max(required - collected, 0),
      };
    }
  );
  return {
    machines,
    totalCollectedAll,
    totalRequiredAll,
    totalRemainingAll: totalRequiredAll - totalCollectedAll,
  };
}

}
