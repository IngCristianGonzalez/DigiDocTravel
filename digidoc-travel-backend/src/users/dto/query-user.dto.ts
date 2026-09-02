import { IsOptional, IsString, IsBooleanString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class QueryUserDto extends PaginationDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBooleanString()
  status?: string;
}
