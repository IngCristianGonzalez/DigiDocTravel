import { IsEmail, IsString, IsOptional, IsInt, Min, IsBoolean, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(4, { message: 'La identificación debe tener mínimo 4 caracteres' })
  @MaxLength(50)
  @Matches(/^[A-Za-z0-9.\-]+$/, { message: 'La identificación solo admite letras, números, puntos y guiones' })
  identification?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  countryOrigin?: string;

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

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
