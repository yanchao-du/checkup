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
  // Regex: ^(\+65)?[89]\d{7}$
  // Breakdown:
  //   ^         - Start of string
  //   (\+65)?   - Optional +65 prefix (for international format)
  //   [89]      - First digit must be 8 or 9 (Singapore mobile prefix)
  //   \d{7}     - Exactly 7 more digits (total 8 digits)
  //   $         - End of string
  // Valid: 91234567, +6591234567, 81234567, +6581234567
  @Matches(/^(\+65)?[89]\d{7}$/, { message: 'Mobile number must be 8 digits starting with 8 or 9' })
  patientMobile?: string;
  
  @IsOptional()
  @IsString()
  drivingLicenseClass?: string;
  
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

  @IsOptional()
  @IsString()
  clinicId?: string;
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
  // Regex: ^(\+65)?[89]\d{7}$
  // Breakdown:
  //   ^         - Start of string
  //   (\+65)?   - Optional +65 prefix (for international format)
  //   [89]      - First digit must be 8 or 9 (Singapore mobile prefix)
  //   \d{7}     - Exactly 7 more digits (total 8 digits)
  //   $         - End of string
  // Valid: 91234567, +6591234567, 81234567, +6581234567
  @Matches(/^(\+65)?[89]\d{7}$/, { message: 'Mobile number must be 8 digits starting with 8 or 9' })
  patientMobile?: string;
  
  @IsOptional()
  @IsString()
  drivingLicenseClass?: string;
  
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

  @IsOptional()
  @IsString()
  clinicId?: string;
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
