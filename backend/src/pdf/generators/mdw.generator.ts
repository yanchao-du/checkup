import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';
import { getTestResult, isTestPositive, formatBoolean } from '../utils/formatters';

export function generateMdwContent(submission: SubmissionData): Content[] {
  const formData = submission.formData;
  
  const tests = {
    pregnancy: true,
    syphilis: true,
    hiv: formData.hivTestRequired === 'true',
    chestXray: formData.chestXrayRequired === 'true',
  };

  const content: Content[] = [];

  // Test Results Section
  content.push({
    text: 'Test Results',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  const testRows: any[] = [
    [
      { text: 'Test', style: 'tableHeader' },
      { text: 'Result', style: 'tableHeader' },
    ],
  ];

  if (tests.pregnancy) {
    const result = getTestResult(formData, 'pregnancyTest', 'pregnancyTestPositive');
    const isPositive = isTestPositive(formData, 'pregnancyTestPositive');
    testRows.push([
      { text: 'Pregnancy Test', style: 'tableCell' },
      { 
        text: result, 
        style: isPositive ? 'alert' : 'tableCell',
      },
    ]);
  }

  if (tests.syphilis) {
    const result = getTestResult(formData, 'syphilisTest', 'syphilisTestPositive');
    const isPositive = isTestPositive(formData, 'syphilisTestPositive');
    testRows.push([
      { text: 'Syphilis Test', style: 'tableCell' },
      { 
        text: result, 
        style: isPositive ? 'alert' : 'tableCell',
      },
    ]);
  }

  if (tests.hiv) {
    const result = getTestResult(formData, 'hivTest', 'hivTestPositive');
    const isPositive = isTestPositive(formData, 'hivTestPositive');
    testRows.push([
      { text: 'HIV Test', style: 'tableCell' },
      { 
        text: result, 
        style: isPositive ? 'alert' : 'tableCell',
      },
    ]);
  }

  if (tests.chestXray) {
    const result = getTestResult(formData, 'chestXray', 'chestXrayPositive');
    const isPositive = isTestPositive(formData, 'chestXrayPositive');
    testRows.push([
      { text: 'Chest X-Ray', style: 'tableCell' },
      { 
        text: result, 
        style: isPositive ? 'alert' : 'tableCell',
      },
    ]);
  }

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
    margin: [0, 0, 0, 15] as [number, number, number, number],
  });

  // Physical Examination Details
  content.push({
    text: 'Physical Examination Details',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  const examRows: any[] = [
    [
      { text: 'Observation', style: 'tableHeader' },
      { text: 'Finding', style: 'tableHeader' },
    ],
  ];

  const hasSuspiciousInjuries = String(formData.suspiciousInjuries) === 'true';
  const hasWeightLoss = String(formData.unintentionalWeightLoss) === 'true';

  examRows.push([
    { text: 'Signs of suspicious or unexplained injuries', style: 'tableCell' },
    { 
      text: formatBoolean(formData.suspiciousInjuries), 
      style: hasSuspiciousInjuries ? 'alert' : 'tableCell',
    },
  ]);

  examRows.push([
    { text: 'Unintentional weight loss', style: 'tableCell' },
    { 
      text: formatBoolean(formData.unintentionalWeightLoss), 
      style: hasWeightLoss ? 'alert' : 'tableCell',
    },
  ]);

  if (hasSuspiciousInjuries || hasWeightLoss) {
    examRows.push([
      { text: 'Police report made', style: 'tableCell', bold: true },
      { 
        text: formData.policeReport === 'yes' ? 'Yes' : formData.policeReport === 'no' ? 'No' : '-',
        style: 'tableCell',
        bold: true,
      },
    ]);
  }

  content.push({
    table: {
      widths: ['60%', '40%'],
      body: examRows,
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#e2e8f0',
      vLineColor: () => '#e2e8f0',
    },
    margin: [0, 0, 0, 15] as [number, number, number, number],
  });

  return content;
}
