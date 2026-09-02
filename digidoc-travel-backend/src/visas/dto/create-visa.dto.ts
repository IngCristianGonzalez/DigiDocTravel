import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateVisaDto {
  @IsUUID()
  studentId: string;

  @IsString()
  visaType: string;

  @IsOptional()
  @IsString()
  visaNumber?: string;

  @IsString()
  country: string;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  expiryDate: string;
}
