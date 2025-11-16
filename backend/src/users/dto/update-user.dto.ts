import { IsEmail, IsOptional, IsString, MinLength, IsEnum, Matches, IsArray, ArrayMaxSize, IsIn } from 'class-validator';

const VALID_EXAM_TYPES = [
  'SIX_MONTHLY_MDW',
  'SIX_MONTHLY_FMW',
  'WORK_PERMIT',
  'FULL_MEDICAL_EXAM',
  'AGED_DRIVERS',
  'PR_MEDICAL',
  'STUDENT_PASS_MEDICAL',
  'LTVP_MEDICAL',
  'DRIVING_LICENCE_TP',
  'DRIVING_VOCATIONAL_TP_LTA',
  'VOCATIONAL_LICENCE_LTA',
  'DRIVING_LICENCE_TP_SHORT',
  'DRIVING_VOCATIONAL_TP_LTA_SHORT',
  'VOCATIONAL_LICENCE_LTA_SHORT',
] as const;

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(['doctor', 'nurse', 'admin'])
  role?: 'doctor' | 'nurse' | 'admin';

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]\d{5}[A-Z]$/, {
    message: 'MCR Number must be in format: 1 letter + 5 numbers + 1 letter (e.g., M12345A)'
  })
  mcrNumber?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3, { message: 'Maximum 3 favorite exam types allowed' })
  @IsIn(VALID_EXAM_TYPES, { each: true, message: 'Invalid exam type in favoriteExamTypes' })
  favoriteExamTypes?: string[];
}
