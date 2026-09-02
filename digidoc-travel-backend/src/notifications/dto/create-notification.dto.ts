import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsUUID()
  referenceId?: string;
}
