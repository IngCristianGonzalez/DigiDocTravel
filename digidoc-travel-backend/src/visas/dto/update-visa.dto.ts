import { IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateVisaDto {
  @IsOptional()
  @IsString()
  visaType?: string;

  @IsOptional()
  @IsString()
  visaNumber?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
