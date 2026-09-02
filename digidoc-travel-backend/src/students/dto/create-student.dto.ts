import { IsEmail, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  countryOrigin: string;

  @IsOptional()
  @IsString()
  cityOrigin?: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @IsString()
  career?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  semester?: number;
}
