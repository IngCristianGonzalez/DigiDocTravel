import { IsString, MinLength } from 'class-validator';

export class CreateObservationDto {
  @IsString()
  @MinLength(3)
  observation: string;
}
