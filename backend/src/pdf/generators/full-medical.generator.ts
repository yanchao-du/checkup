import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';
import { formatBoolean } from '../utils/formatters';

const medicalHistoryConditions = [
  { key: 'cardiovascular', label: 'Cardiovascular disease (e.g. ischemic heart disease)' },
  { key: 'gastrointestinal', label: 'Gastrointestinal disease (e.g. peptic ulcer disease)' },
  { key: 'lifestyleRiskFactors', label: 'Other lifestyle risk factors or significant family history' },
  { key: 'longTermMedications', label: 'Long-term medications' },
  { key: 'mentalHealth', label: 'Mental health condition (e.g. depression)' },
  { key: 'metabolic', label: 'Metabolic disease (diabetes, hypertension)' },
  { key: 'neurological', label: 'Neurological disease (e.g. epilepsy, stroke)' },
  { key: 'previousInfections', label: 'Previous infections of concern (e.g. COVID-19)' },
  { key: 'previousSurgeries', label: 'Previous surgeries' },
  { key: 'respiratory', label: 'Respiratory disease (e.g. tuberculosis, asthma)' },
  { key: 'smokingHistory', label: 'Smoking History (tobacco)' },
  { key: 'otherMedical', label: 'Other medical condition' },
];

const medicalTests = [
  { key: 'hiv', label: 'HIV', checkboxLabel: 'Positive', normalLabel: 'Negative' },
  { key: 'pregnancy', label: 'Pregnancy', femaleOnly: true, checkboxLabel: 'Positive', normalLabel: 'Negative' },
  { key: 'urineAlbumin', label: 'Urine Albumin', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
  { key: 'urineSugar', label: 'Urine Sugar', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
  { key: 'bloodPressure', label: 'Blood Pressure', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
  { key: 'malaria', label: 'Malaria', checkboxLabel: 'Positive', normalLabel: 'Negative' },
  { key: 'colourVision', label: 'Colour Vision', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
];

function getChestXrayLabel(value: string): string {
  const labels: Record<string, string> = {
    'normal': 'Normal',
    'no-referral': 'No referral needed',
    'cleared-ntbcc': 'Cleared by NTBCC',
    'pending-clearance-ntbcc': 'Pending clearance by NTBCC',
    'pregnancy-exempted': 'Exempted due to pregnancy',
  };
  return labels[value] || value;
}

function getSyphilisLabel(value: string): string {
  const labels: Record<string, string> = {
    'normal': 'Normal',
    'positive-infectious': 'Positive - Currently Infectious',
    'positive-treated': 'Positive - Treated Inactive',
  };
  return labels[value] || value;
}

export function generateFullMedicalContent(submission: SubmissionData): Content[] {
  const formData = submission.formData;
  const content: Content[] = [];
  const isFemale = formData.gender === 'F';

  // Medical History Section
  content.push({
    text: 'Medical History of Patient',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  const checkedHistoryItems: Array<{ label: string; remarks?: string }> = [];
  medicalHistoryConditions.forEach((condition) => {
    if (formData[`medicalHistory_${condition.key}`] === 'yes') {
      checkedHistoryItems.push({ 
        label: condition.label,
        remarks: formData[`medicalHistory_${condition.key}Remarks`] || ''
      });
    }
  });

  if (checkedHistoryItems.length > 0) {
    const historyList: any[] = [];
    checkedHistoryItems.forEach((item) => {
      historyList.push({
        text: item.label,
        style: 'alert',
        margin: [0, 2, 0, item.remarks ? 1 : 5] as [number, number, number, number],
      });
      if (item.remarks) {
        historyList.push({
          text: `Remarks: ${item.remarks}`,
          fontSize: 9,
          italics: true,
          margin: [10, 0, 0, 5] as [number, number, number, number],
        });
      }
    });
    content.push({
      ul: historyList,
      margin: [0, 0, 0, 15] as [number, number, number, number],
    });
  } else {
    content.push({
      text: 'No medical history conditions reported',
      fontSize: 9,
      italics: true,
      color: '#64748b',
      margin: [0, 0, 0, 15] as [number, number, number, number],
    });
  }

  // Medical Examination
  content.push({
    text: 'Medical Examination',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  const testRows: any[] = [
    [
      { text: 'Test', style: 'tableHeader' },
      { text: 'Result', style: 'tableHeader' },
    ],
  ];

  // Chest X-ray
  const chestXrayLabel = getChestXrayLabel(formData.chestXray || 'Not specified');
  const chestXrayAlert = formData.chestXray === 'pending-clearance-ntbcc' || formData.chestXray === 'positive-infectious';
  testRows.push([
    { text: 'Chest X-ray', style: 'tableCell' },
    { 
      text: chestXrayLabel, 
      fontSize: 10,
      margin: [3, 2, 3, 2] as [number, number, number, number],
      alignment: 'left',
      ...(chestXrayAlert && { bold: true, color: '#dc2626' }),
    },
  ]);

  // Syphilis
  const syphilisLabel = getSyphilisLabel(formData.syphilis || 'Not specified');
  const syphilisAlert = formData.syphilis === 'positive-infectious';
  testRows.push([
    { text: 'Syphilis', style: 'tableCell' },
    { 
      text: syphilisLabel,
      fontSize: 10,
      margin: [3, 2, 3, 2] as [number, number, number, number],
      alignment: 'left',
      ...(syphilisAlert && { bold: true, color: '#dc2626' }),
    },
  ]);

  // Other tests
  medicalTests.forEach((test) => {
    if (test.femaleOnly && !isFemale) return;
    
    const isAbnormal = formData[`test_${test.key}`] === 'yes';
    testRows.push([
      { text: test.label, style: 'tableCell' },
      { 
        text: isAbnormal ? test.checkboxLabel : test.normalLabel,
        fontSize: 10,
        margin: [3, 2, 3, 2] as [number, number, number, number],
        alignment: 'left',
        ...(isAbnormal && { bold: true, color: '#dc2626' }),
      },
    ]);
  });

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

  // Other Abnormalities
  if (formData.otherAbnormalities) {
    content.push({
      text: 'Other Abnormalities',
      style: 'sectionTitle',
      margin: [0, 10, 0, 5] as [number, number, number, number],
    });
    content.push({
      text: formData.otherAbnormalities,
      style: 'value',
      margin: [0, 0, 0, 15] as [number, number, number, number],
    });
  }

  // Overall Result
  if (formData.fitForWork) {
    content.push({
      text: 'Overall Result of Medical Examination',
      style: 'sectionTitle',
      margin: [0, 10, 0, 5] as [number, number, number, number],
    });
    
    const isFit = formData.fitForWork === 'yes';
    content.push({
      text: isFit ? 'YES - Patient is fit for work' : 'NO - Patient is not fit for work',
      bold: true,
      fontSize: 12,
      color: isFit ? '#16a34a' : '#dc2626',
      margin: [0, 0, 0, 15] as [number, number, number, number],
    });
  }

  return content;
}
