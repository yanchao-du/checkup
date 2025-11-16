import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';
import { getExamTypeDisplayName } from '../utils/exam-type-mapper';
import { format } from 'date-fns';

export function buildHeader(submission: SubmissionData): Content[] {
  const submittedDateTime = submission.submittedDate 
    ? format(new Date(submission.submittedDate), 'dd MMM yyyy, hh:mm a')
    : 'N/A';

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
            { text: 'Reference Number', style: 'tableCell', bold: true },
            { text: submission.id, style: 'tableCell' },
          ],
          [
            { text: 'Submission Date & Time', style: 'tableCell', bold: true },
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
