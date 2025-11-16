import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';
import { formatDate } from '../utils/formatters';

export function buildDeclaration(submission: SubmissionData): Content[] {
  // Only show declaration for submitted exams
  if (submission.status !== 'submitted') {
    return [];
  }

  const doctorName = submission.approvedByName;
  const doctorMcr = submission.approvedByMcrNumber;
  const createdByName = submission.createdByName;
  const createdByMcr = submission.createdByMcrNumber;
  const clinicName = submission.clinicName;
  const clinicHciCode = submission.clinicHciCode;
  const clinicPhone = submission.clinicPhone;

  const content: Content[] = [
    {
      text: 'Declaration',
      style: 'sectionTitle',
      margin: [0, 20, 0, 10] as [number, number, number, number],
    },
  ];

  // Declaration statement
  const isIcaExam = submission.examType === 'PR_MEDICAL' || 
                    submission.examType === 'STUDENT_PASS_MEDICAL' || 
                    submission.examType === 'LTVP_MEDICAL';

  const declarationPoints = [
    'I am authorised by the clinic to submit the results and make the declarations in this form on its behalf.',
    isIcaExam 
      ? 'By submitting this form, I understand that the information given will be submitted to the Commissioner of Immigration or an authorised officer who may act on the information given by me. I further declare that the information provided by me is true to the best of my knowledge and belief.'
      : 'By submitting this form, I understand that the information given will be submitted to the Controller or an authorised officer who may act on the information given by me. I further declare that the information provided by me is true to the best of my knowledge and belief.',
  ];

  if (isIcaExam) {
    declarationPoints.push('I have obtained the consent from the patient to submit the medical exam report to the Commissioner of Immigration.');
  }

  content.push({
    ul: declarationPoints.map(point => ({
      text: point,
      fontSize: 9,
      margin: [0, 2, 0, 2] as [number, number, number, number],
    })),
    margin: [0, 0, 0, 10] as [number, number, number, number],
  });

  content.push({
    text: '\u2714 Declared that all of the above is true.',
    fontSize: 10,
    bold: true,
    color: '#1e40af',
    margin: [0, 5, 0, 15] as [number, number, number, number],
  });

  // Show "Prepared by" if we have both creator and approver
  if (doctorName && createdByName) {
    content.push({
      stack: [
        { text: 'Prepared by', fontSize: 10, bold: true, color: '#1e40af', margin: [0, 0, 0, 5] as [number, number, number, number] },
        { text: `Name: ${createdByName}`, fontSize: 10, margin: [0, 2, 0, 2] as [number, number, number, number] },
        ...(createdByMcr ? [{ text: `MCR Number: ${createdByMcr}`, fontSize: 10, margin: [0, 2, 0, 2] as [number, number, number, number] }] : []),
      ],
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });
  }

  // Examining Doctor
  if (doctorName) {
    content.push({
      stack: [
        { text: 'Examining Doctor', fontSize: 10, bold: true, color: '#1e40af', margin: [0, 0, 0, 5] as [number, number, number, number] },
        { text: `Name: ${doctorName}`, fontSize: 10, margin: [0, 2, 0, 2] as [number, number, number, number] },
        ...(doctorMcr ? [{ text: `MCR Number: ${doctorMcr}`, fontSize: 10, margin: [0, 2, 0, 2] as [number, number, number, number] }] : []),
      ],
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });
  }

  // Clinic Information
  if (clinicName) {
    content.push({
      stack: [
        { text: 'Clinic Information', fontSize: 10, bold: true, color: '#1e40af', margin: [0, 0, 0, 5] as [number, number, number, number] },
        { text: `Name: ${clinicName}`, fontSize: 10, margin: [0, 2, 0, 2] as [number, number, number, number] },
        ...(clinicHciCode ? [{ text: `HCI Code: ${clinicHciCode}`, fontSize: 10, margin: [0, 2, 0, 2] as [number, number, number, number] }] : []),
        ...(clinicPhone ? [{ text: `Phone: ${clinicPhone}`, fontSize: 10, margin: [0, 2, 0, 2] as [number, number, number, number] }] : []),
      ],
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });
  }

  return content;
}
