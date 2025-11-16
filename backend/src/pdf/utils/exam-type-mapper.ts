// Exam type display names mapping
export const examTypeDisplayNames: Record<string, string> = {
  'SIX_MONTHLY_MDW': 'Six-monthly Medical Exam for Migrant Domestic Workers (MOM)',
  'SIX_MONTHLY_FMW': 'Six-monthly Medical Exam for Female Migrant Workers (MOM)',
  'WORK_PERMIT': 'Full Medical Exam for Work Permit (MOM)',
  'FULL_MEDICAL_EXAM': 'Full Medical Examination for Foreign Worker (MOM)',
  'AGED_DRIVERS': 'Medical Exam for Aged Drivers (SPF)',
  'PR_MEDICAL': 'Medical Examination for Permanent Residency (ICA)',
  'STUDENT_PASS_MEDICAL': 'Medical Examination for Student Pass (ICA)',
  'LTVP_MEDICAL': 'Medical Examination for Long Term Visit Pass (ICA)',
  'DRIVING_LICENCE_TP': 'Driving Licence Medical Examination Report (TP)',
  'DRIVING_VOCATIONAL_TP_LTA': 'Driving Licence (TP) / Vocational Licence (LTA)',
  'VOCATIONAL_LICENCE_LTA': 'Vocational Licence Medical Examination (LTA)',
  'DRIVING_LICENCE_TP_SHORT': 'Driving Licence (TP) Medical Exam',
  'DRIVING_VOCATIONAL_TP_LTA_SHORT': 'Driving Licence (TP) / Vocational Licence (LTA) Medical Exam',
  'VOCATIONAL_LICENCE_LTA_SHORT': 'Vocational Licence (LTA) Medical Exam',
};

export function getExamTypeDisplayName(examType: string): string {
  return examTypeDisplayNames[examType] || examType;
}
