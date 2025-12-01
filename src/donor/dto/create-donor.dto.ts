import { IsOptional, IsString } from 'class-validator';

export class CreateDonorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  donorType?: string;

  @IsOptional()
  @IsString()
  contactNo?: string;

  @IsOptional()
  @IsString()
  instituteOrganization?: string;
}
