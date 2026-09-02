import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateDocumentDto {
  @IsUUID()
  studentId: string;

  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  fileSize?: number;

  @IsOptional()
  @IsString()
  fileType?: string;
}
