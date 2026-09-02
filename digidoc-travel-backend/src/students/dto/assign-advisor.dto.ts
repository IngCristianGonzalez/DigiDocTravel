import { IsUUID } from 'class-validator';

export class AssignAdvisorDto {
  @IsUUID()
  advisorId: string;
}
