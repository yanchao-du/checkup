import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsDateString, IsObject, IsBoolean, IsInt, Min, IsEmail, Matches } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  examType: string;
  
  @IsString()
  patientName: string;
  
  @IsString()
  patientNric: string;
  
  @IsOptional()
  @IsDateString()
  patientDateOfBirth?: string;
  
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  patientEmail?: string;
  
  @IsOptional()
  @Matches(/^(\+65)?[89]\d{7}$/, { message: 'Mobile number must be 8 digits starting with 8 or 9' })
  patientMobile?: string;
  
  @IsOptional()
  @IsDateString()
  examinationDate?: string;
  
  @IsObject()
  formData: Record<string, any>;
  
  @IsOptional()
  @IsBoolean()
  routeForApproval?: boolean;

  @IsOptional()
  @IsString()
  assignedDoctorId?: string;
}

export class UpdateSubmissionDto {
  @IsOptional()
  @IsString()
  examType?: string;

  @IsOptional()
  @IsString()
  patientName?: string;
  
  @IsOptional()
  @IsString()
  patientNric?: string;
  
  @IsOptional()
  @IsDateString()
  patientDateOfBirth?: string;
  
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  patientEmail?: string;
  
  @IsOptional()
  @Matches(/^(\+65)?[89]\d{7}$/, { message: 'Mobile number must be 8 digits starting with 8 or 9' })
  patientMobile?: string;
  
  @IsOptional()
  @IsDateString()
  examinationDate?: string;
  
  @IsOptional()
  @IsObject()
  formData?: Record<string, any>;

  @IsOptional()
  @IsString()
  assignedDoctorId?: string;

  @IsOptional()
  @IsBoolean()
  routeForApproval?: boolean;
}

export class SubmissionQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
  
  @IsOptional()
  @IsString()
  examType?: string;
  
  @IsOptional()
  @IsString()
  patientName?: string;
  
  @IsOptional()
  @IsString()
  patientNric?: string;
  
  @IsOptional()
  @IsDateString()
  fromDate?: string;
  
  @IsOptional()
  @IsDateString()
  toDate?: string;
  
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeDeleted?: boolean;
  
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
