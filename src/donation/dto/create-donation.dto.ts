import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateDonorDto } from 'src/donor/dto/create-donor.dto';

export class CreateDonationDto {
  // donation fields
  @IsOptional()
  @IsString()
  donationFor?: string;

  @IsOptional()
  @IsString()
  donationType?: string;

  @IsOptional()
  @IsString()
  methodMode?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  pledgeDate?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  // donor nested object
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateDonorDto)
  donor: CreateDonorDto;
}
