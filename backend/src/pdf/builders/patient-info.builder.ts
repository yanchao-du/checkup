import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';
import { formatDate, maskName } from '../utils/formatters';

// Map purpose of exam codes to display names
function getPurposeOfExamDisplayName(purposeOfExam: string): string {
  const displayNames: Record<string, string> = {
    'AGE_65_ABOVE_TP_ONLY': 'Age 65 and above - Renew Traffic Police Driving Licence only',
    'AGE_65_ABOVE_TP_LTA': 'Age 65 and above - Renew both Traffic Police & LTA Vocational Licence',
    'AGE_64_BELOW_LTA_ONLY': 'Age 64 and below - Renew LTA Vocational Licence only',
    'BAVL_ANY_AGE': 'Renew only Bus Attendant\'s Vocational Licence (BAVL) regardless of age',
    'AGE_65_ABOVE_DRIVING_ONLY': 'Age 65 and above - Renew driving licence only',
  };
  
  return displayNames[purposeOfExam] || purposeOfExam;
}

export function buildPatientInfo(submission: SubmissionData): Content[] {
  const rows: any[] = [];

  // Check if this is a MOM exam (MDW, FMW, Full Medical)
  const isMomExam = submission.examType === 'SIX_MONTHLY_MDW' || 
                    submission.examType === 'SIX_MONTHLY_FMW' || 
                    submission.examType === 'FULL_MEDICAL_EXAM';

  // Check if this is an ICA exam (PR, Student Pass, LTVP)
  const isIcaExam = submission.examType === 'PR_MEDICAL' || 
                    submission.examType === 'STUDENT_PASS_MEDICAL' || 
                    submission.examType === 'LTVP_MEDICAL';

  // Check if this is a driving exam
  const isDrivingExam = submission.examType === 'DRIVING_LICENCE_TP' || 
                        submission.examType === 'DRIVING_VOCATIONAL_TP_LTA' || 
                        submission.examType === 'VOCATIONAL_LICENCE_LTA' ||
                        submission.examType === 'AGED_DRIVERS';

  // Patient Name (show full name for submitted reports, mask for drafts)
  const displayName = submission.status === 'submitted' ? submission.patientName : maskName(submission.patientName);
  rows.push([
    { text: 'Patient Name', style: 'tableCell', bold: true },
    { text: displayName, style: 'tableCell' },
  ]);

  // NRIC/FIN or Passport
  if (submission.patientNric) {
    let nricLabel = 'NRIC';
    if (isMomExam || isIcaExam) {
      nricLabel = 'FIN';
    } else if (isDrivingExam) {
      nricLabel = 'NRIC/FIN';
    }
    
    rows.push([
      { text: nricLabel, style: 'tableCell' },
      { text: submission.patientNric, style: 'tableCell' },
    ]);
  }

  if (submission.patientPassportNo) {
    rows.push([
      { text: 'Passport No.', style: 'tableCell' },
      { text: submission.patientPassportNo, style: 'tableCell' },
    ]);
  }

  // Date of Birth
  if (submission.patientDateOfBirth) {
    rows.push([
      { text: 'Date of Birth', style: 'tableCell' },
      { text: formatDate(submission.patientDateOfBirth), style: 'tableCell' },
    ]);
  }

  // Contact Information
  // For driving and ICA exams, always show email (even if empty or "-")
  if (isDrivingExam || isIcaExam) {
    rows.push([
      { text: 'Email', style: 'tableCell' },
      { text: submission.patientEmail || '-', style: 'tableCell' },
    ]);
  } else if (submission.patientEmail) {
    rows.push([
      { text: 'Email', style: 'tableCell' },
      { text: submission.patientEmail, style: 'tableCell' },
    ]);
  }

  // For driving exams, always show mobile number (even if empty or "-")
  if (isDrivingExam) {
    rows.push([
      { text: 'Mobile', style: 'tableCell' },
      { text: submission.patientMobile || '-', style: 'tableCell' },
    ]);
  } else if (submission.patientMobile) {
    rows.push([
      { text: 'Mobile', style: 'tableCell' },
      { text: submission.patientMobile, style: 'tableCell' },
    ]);
  }

  // Examination Date
  if (submission.examinationDate) {
    rows.push([
      { text: 'Examination Date', style: 'tableCell' },
      { text: formatDate(submission.examinationDate), style: 'tableCell' },
    ]);
  }

  // Driving License specific fields
  if (submission.drivingLicenseClass) {
    rows.push([
      { text: 'Driving License Class', style: 'tableCell' },
      { text: submission.drivingLicenseClass, style: 'tableCell' },
    ]);
  }

  if (submission.purposeOfExam) {
    rows.push([
      { text: 'Purpose of Exam', style: 'tableCell' },
      { text: getPurposeOfExamDisplayName(submission.purposeOfExam), style: 'tableCell' },
    ]);
  }

  return [
    {
      text: 'Patient Information',
      style: 'sectionTitle',
      margin: [0, 10, 0, 5] as [number, number, number, number],
    },
    {
      table: {
        widths: ['30%', '70%'],
        body: rows,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#e2e8f0',
        vLineColor: () => '#e2e8f0',
      },
      margin: [0, 0, 0, 15] as [number, number, number, number],
    },
  ];
}
