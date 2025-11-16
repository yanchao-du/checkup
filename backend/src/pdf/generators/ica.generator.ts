import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';
import { getTestResult, isTestPositive } from '../utils/formatters';

export function generateIcaContent(submission: SubmissionData): Content[] {
  const formData = submission.formData;
  const content: Content[] = [];

  // Test Results Section
  content.push({
    text: 'Test Results',
    style: 'sectionTitle',
    margin: [0, 8, 0, 4] as [number, number, number, number],
  });

  const testRows: any[] = [
    [
      { text: 'Test', style: 'tableHeader' },
      { text: 'Result', style: 'tableHeader' },
    ],
  ];

  // HIV test (always required for ICA exams)
  const hivResult = getTestResult(formData, 'hivTest', 'hivTestPositive');
  const hivPositive = isTestPositive(formData, 'hivTestPositive');
  testRows.push([
    { text: 'HIV Test', style: 'tableCell' },
    { 
      text: hivResult, 
      style: hivPositive ? 'alert' : 'tableCell',
    },
  ]);

  // Chest X-Ray (always show for ICA exams)
  const xrayResult = getTestResult(formData, 'chestXray', 'chestXrayPositive');
  const xrayPositive = isTestPositive(formData, 'chestXrayPositive');
  testRows.push([
    { text: 'Chest X-Ray', style: 'tableCell' },
    { 
      text: xrayResult, 
      style: xrayPositive ? 'alert' : 'tableCell',
    },
  ]);

  content.push({
    table: {
      widths: ['50%', '50%'],
      body: testRows,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#e2e8f0',
      vLineColor: () => '#e2e8f0',
    },
    margin: [0, 0, 0, 10] as [number, number, number, number],
  });

  return content;
}
