import type { ExamType } from '../types/api';

/**
 * Formats exam type enum value to display name
 */
export function formatExamType(examType: ExamType): string {
  switch (examType) {
    case 'SIX_MONTHLY_MDW':
      return 'MDW Six-monthly (MOM)';
    case 'SIX_MONTHLY_FMW':
      return 'FMW Six-monthly (MOM)';
    case 'WORK_PERMIT':
      return 'Work Permit (MOM)';
    case 'AGED_DRIVERS':
      return 'Aged Drivers (SPF)';
    default:
      return examType;
  }
}

/**
 * Formats exam type enum value to full display name
 */
export function formatExamTypeFull(examType: ExamType): string {
  switch (examType) {
    case 'SIX_MONTHLY_MDW':
  return 'Six-monthly Medical Exam for Migrant Domestic Worker';
    case 'SIX_MONTHLY_FMW':
      return 'Six-monthly Medical Exam for Female Migrant Worker';
    case 'WORK_PERMIT':
      return 'Full Medical Exam for Work Permit';
    case 'AGED_DRIVERS':
      return 'Medical Exam for Aged Drivers';
    default:
      return examType;
  }
}
