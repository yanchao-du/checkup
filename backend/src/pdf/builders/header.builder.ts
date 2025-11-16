import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';
import { getExamTypeDisplayName } from '../utils/exam-type-mapper';
import { format } from 'date-fns';

function getSubmittedTo(submission: SubmissionData): string {
  const { examType, purposeOfExam } = submission;
  
  // MOM exams
  if (examType === 'SIX_MONTHLY_MDW' || 
      examType === 'SIX_MONTHLY_FMW' || 
      examType === 'WORK_PERMIT' ||
      examType === 'FULL_MEDICAL_EXAM') {
    return 'Ministry of Manpower';
  }
  
  // ICA exams
  if (examType === 'PR_MEDICAL' || 
      examType === 'STUDENT_PASS_MEDICAL' || 
      examType === 'LTVP_MEDICAL') {
    return 'Immigration & Checkpoints Authority';
  }
  
  // SPF exam
  if (examType === 'AGED_DRIVERS') {
    return 'Singapore Police Force';
  }
  
  // Driver exams (including short forms)
  if (examType === 'DRIVING_LICENCE_TP' || 
      examType === 'DRIVING_VOCATIONAL_TP_LTA' ||
      examType === 'DRIVING_LICENCE_TP_SHORT' ||
      examType === 'DRIVING_VOCATIONAL_TP_LTA_SHORT' ||
      examType === 'VOCATIONAL_LICENCE_LTA_SHORT') {
    if (purposeOfExam === 'AGE_65_ABOVE_DRIVING_ONLY' || purposeOfExam === 'AGE_65_ABOVE_TP_ONLY') {
      return 'Traffic Police';
    }
    if (purposeOfExam === 'AGE_65_ABOVE_TP_LTA') {
      return 'Traffic Police & Land Transport Authority';
    }
    if (purposeOfExam === 'AGE_64_BELOW_LTA_ONLY' || purposeOfExam === 'BAVL_ANY_AGE') {
      return 'Land Transport Authority';
    }
    return 'Traffic Police / Land Transport Authority';
  }
  
  // LTA vocational exam
  if (examType === 'VOCATIONAL_LICENCE_LTA') {
    return 'Land Transport Authority';
  }
  
  return 'N/A';
}

export function buildHeader(submission: SubmissionData): Content[] {
  const submittedDateTime = submission.submittedDate 
    ? format(new Date(submission.submittedDate), 'dd MMM yyyy, hh:mm a')
    : 'N/A';
  
  const submittedTo = getSubmittedTo(submission);

  return [
    // CheckUp Logo/Branding
    {
      columns: [
        {
          width: 'auto',
          text: [
            { text: 'go', color: '#0ea5a4', fontSize: 16, bold: true },
            { text: 'CheckUp', color: '#000000', fontSize: 16, bold: true },
          ],
        },
      ],
      margin: [0, 0, 0, 15] as [number, number, number, number],
    },
    {
      text: getExamTypeDisplayName(submission.examType),
      style: 'header',
      alignment: 'center',
      margin: [0, 0, 0, 20] as [number, number, number, number],
    },
    {
      text: 'Report Information',
      style: 'sectionTitle',
      margin: [0, 0, 0, 5] as [number, number, number, number],
    },
    {
      table: {
        widths: ['30%', '70%'],
        body: [
          [
            { text: 'Reference Number', style: 'tableCell' },
            { text: submission.id, style: 'tableCell' },
          ],
          [
            { text: 'Submitted To', style: 'tableCell' },
            { text: submittedTo, style: 'tableCell' },
          ],
          [
            { text: 'Submission Date & Time', style: 'tableCell' },
            { text: submittedDateTime, style: 'tableCell' },
          ],
        ],
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
