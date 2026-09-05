import { IsEmail, IsString, IsOptional, IsInt, IsNotEmpty, Min, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'La identificación es obligatoria' })
  @MinLength(4, { message: 'La identificación debe tener mínimo 4 caracteres' })
  @MaxLength(50)
  @Matches(/^[A-Za-z0-9.\-]+$/, { message: 'La identificación solo admite letras, números, puntos y guiones' })
  identification: string;

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
