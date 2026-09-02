import { IsNumber, Min, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}
