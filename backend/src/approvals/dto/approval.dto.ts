import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class ApprovalQueryDto {
  @IsOptional()
  @IsString()
  examType?: string;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number;
  
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number;
}

export class ApproveDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
