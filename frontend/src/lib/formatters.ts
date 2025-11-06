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
    case 'FULL_MEDICAL_EXAM':
      return 'Full Medical Exam (MOM)';
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
  return 'Six-monthly Medical Exam (6ME) for Migrant Domestic Worker';
    case 'SIX_MONTHLY_FMW':
      return 'Six-monthly Medical Examination (6ME) for Female Migrant Worker';
    case 'WORK_PERMIT':
      return 'Full Medical Examination for Work Permit';
    case 'FULL_MEDICAL_EXAM':
      return 'Full Medical Examination for Foreign Worker';
    case 'AGED_DRIVERS':
      return 'Medical Examination for Aged Drivers';
    case 'DRIVING_LICENCE_TP':
      return 'Medical Examination for Driving Licence for Aged Drivers (65 and above)';
    case 'DRIVING_VOCATIONAL_TP_LTA':
      return 'Medical Examination for Vocational Licence for Aged Drivers (65 and above)';
    case 'VOCATIONAL_LICENCE_LTA':
      return 'Medical Examination for Vocational Licence';
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
    case 'FULL_MEDICAL_EXAM':
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
