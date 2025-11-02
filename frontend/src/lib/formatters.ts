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
    case 'DRIVING_LICENCE_TP':
      return 'Driving Licence (TP)';
    case 'DRIVING_VOCATIONAL_TP_LTA':
      return 'Driving Vocational (TP/LTA)';
    case 'VOCATIONAL_LICENCE_LTA':
      return 'Vocational Licence (LTA)';
    case 'PR_MEDICAL':
      return 'PR Medical (ICA)';
    case 'STUDENT_PASS_MEDICAL':
      return 'Student Pass (ICA)';
    case 'LTVP_MEDICAL':
      return 'LTVP (ICA)';
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
    case 'DRIVING_LICENCE_TP':
      return 'Medical Examination Report for Driving Licence';
    case 'DRIVING_VOCATIONAL_TP_LTA':
      return 'Medical Examination Report for Driving Vocational Licence';
    case 'VOCATIONAL_LICENCE_LTA':
      return 'Medical Examination Report for Vocational Licence';
    case 'PR_MEDICAL':
      return 'Medical Examination for Permanent Residency';
    case 'STUDENT_PASS_MEDICAL':
      return 'Medical Examination for Student Pass';
    case 'LTVP_MEDICAL':
      return 'Medical Examination for Long Term Visit Pass';
    default:
      return examType;
  }
}

/**
 * Formats exam type to government agency name
 */
export function formatAgency(examType: ExamType): string {
  switch (examType) {
    case 'SIX_MONTHLY_MDW':
    case 'SIX_MONTHLY_FMW':
    case 'WORK_PERMIT':
      return 'MOM';
    case 'AGED_DRIVERS':
      return 'SPF';
    case 'DRIVING_LICENCE_TP':
      return 'TP';
    case 'DRIVING_VOCATIONAL_TP_LTA':
      return 'TP/LTA';
    case 'VOCATIONAL_LICENCE_LTA':
      return 'LTA';
    case 'PR_MEDICAL':
    case 'STUDENT_PASS_MEDICAL':
    case 'LTVP_MEDICAL':
      return 'ICA';
    default:
      return 'Unknown';
  }
}
