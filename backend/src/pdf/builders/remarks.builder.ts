import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';

export function buildRemarks(submission: SubmissionData): Content[] {
  const formData = submission.formData;
  
  if (!formData.remarks) {
    return [];
  }

  return [
    {
      text: 'Remarks',
      style: 'sectionTitle',
      margin: [0, 15, 0, 5] as [number, number, number, number],
    },
    {
      text: formData.remarks,
      style: 'remarks',
    },
  ];
}
