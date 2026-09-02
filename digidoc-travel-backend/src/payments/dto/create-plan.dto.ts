import { IsString, IsNumber, IsInt, Min, IsDateString, IsUUID } from 'class-validator';

export class CreatePlanDto {
  @IsUUID()
  studentId: string;

  @IsString()
  concept: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsInt()
  @Min(1)
  installments: number;

  @IsDateString()
  startDate: string;
}
