import { IsArray, ArrayMaxSize, IsIn } from 'class-validator';

const VALID_EXAM_TYPES = [
  'SIX_MONTHLY_MDW',
  'FULL_MEDICAL_EXAM',
  'SIX_MONTHLY_FMW',
  'DRIVING_VOCATIONAL_TP_LTA',
  'PR_MEDICAL',
  'LTVP_MEDICAL',
  'STUDENT_PASS_MEDICAL',
];

export class UpdateFavoritesDto {
  @IsArray()
  @ArrayMaxSize(3, { message: 'Maximum 3 favorite exam types allowed' })
  @IsIn(VALID_EXAM_TYPES, {
    each: true,
    message: 'Invalid exam type',
  })
  favoriteExamTypes: string[];
}
