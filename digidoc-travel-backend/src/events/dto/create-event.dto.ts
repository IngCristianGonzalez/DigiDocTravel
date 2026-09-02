import { IsString, IsDateString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  eventDate: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];
}
