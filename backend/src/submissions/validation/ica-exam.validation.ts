import { BadRequestException } from '@nestjs/common';
import { CreateSubmissionDto } from '../dto/submission.dto';

/**
 * Check if exam type is an ICA exam
 */
export function isIcaExamType(examType: string): boolean {
  return examType === 'PR_MEDICAL' || 
         examType === 'STUDENT_PASS_MEDICAL' || 
         examType === 'LTVP_MEDICAL';
}

/**
 * Validate ICA exam submissions
 * For ICA exams:
 * - Passport number is required
 * - NRIC/FIN is optional
 */
export function validateIcaExam(dto: CreateSubmissionDto): void {
  const examType = dto.examType;
  
  if (!isIcaExamType(examType)) {
    return; // Not an ICA exam, skip validation
  }

  // Passport number is required for ICA exams
  if (!dto.patientPassportNo || dto.patientPassportNo.trim() === '') {
    throw new BadRequestException('Passport number is required for ICA medical examinations');
  }
}
