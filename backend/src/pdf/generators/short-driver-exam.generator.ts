import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';

const PURPOSE_LABELS: Record<string, string> = {
  AGE_65_ABOVE_TP_ONLY: 'Age 65+ TP Only',
  AGE_65_ABOVE_TP_LTA: 'Age 65+ TP & LTA',
  AGE_64_BELOW_LTA_ONLY: 'Age 64 & Below LTA Only',
  BAVL_ANY_AGE: 'BAVL (Any Age)',
};

export function generateShortDriverExamContent(submission: SubmissionData): Content[] {
  const formData = submission.formData;
  const content: Content[] = [];

  // Patient Information Section
  content.push({
    text: 'Patient Information',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  const patientInfo: Array<{ label: string; value: string }> = [
    { label: 'Name', value: submission.patientName || '-' },
    { label: 'NRIC', value: submission.patientNric || '-' },
    { label: 'Mobile Number', value: submission.patientMobile || '-' },
    { label: 'Purpose of Examination', value: PURPOSE_LABELS[submission.purposeOfExam || ''] || submission.purposeOfExam || '-' },
    { label: 'Examination Date', value: submission.examinationDate || '-' },
  ];

  content.push({
    table: {
      widths: ['30%', '70%'],
      body: patientInfo.map(info => [
        { text: info.label, bold: true, fontSize: 10 },
        { text: info.value, fontSize: 10 },
      ]),
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 15] as [number, number, number, number],
  });

  // Fitness Determination Section
  content.push({
    text: 'Fitness Determination',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  // Determine which fitness questions are relevant
  const purpose = submission.purposeOfExam;
  const showMotorVehicleFitness = 
    purpose === 'AGE_65_ABOVE_TP_ONLY' || 
    purpose === 'AGE_65_ABOVE_TP_LTA' || 
    purpose === 'AGE_64_BELOW_LTA_ONLY';
  
  const showPsvBavlFitness = 
    purpose === 'AGE_65_ABOVE_TP_LTA' || 
    purpose === 'AGE_64_BELOW_LTA_ONLY' ||
    purpose === 'BAVL_ANY_AGE';

  const fitnessInfo: Array<{ label: string; value: string; show: boolean }> = [
    {
      label: 'Physically and mentally fit to drive a motor vehicle?',
      value: formData.fitToDriveMotorVehicle === 'yes' ? 'Yes' : formData.fitToDriveMotorVehicle === 'no' ? 'No' : '-',
      show: showMotorVehicleFitness,
    },
    {
      label: 'Physically and mentally fit to drive a PSV and/or hold a BAVL?',
      value: formData.fitToDrivePsvBavl === 'yes' ? 'Yes' : formData.fitToDrivePsvBavl === 'no' ? 'No' : '-',
      show: showPsvBavlFitness,
    },
  ];

  const visibleFitnessInfo = fitnessInfo.filter(info => info.show);

  if (visibleFitnessInfo.length > 0) {
    content.push({
      table: {
        widths: ['70%', '30%'],
        body: visibleFitnessInfo.map(info => [
          { text: info.label, fontSize: 10 },
          { 
            text: info.value, 
            fontSize: 10, 
            bold: true,
            color: info.value === 'Yes' ? '#16a34a' : info.value === 'No' ? '#dc2626' : '#64748b'
          },
        ]),
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#e2e8f0',
        vLineColor: () => '#e2e8f0',
      },
      margin: [0, 0, 0, 15] as [number, number, number, number],
    });
  }

  // Declaration Section
  content.push({
    text: 'Declaration',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  content.push({
    text: formData.declarationAgreed 
      ? '✓ I certify that I have examined the above-named person and that the information provided is true and accurate to the best of my knowledge.'
      : 'Declaration not agreed',
    fontSize: 10,
    color: formData.declarationAgreed ? '#16a34a' : '#dc2626',
    margin: [0, 0, 0, 15] as [number, number, number, number],
  });

  // Medical Practitioner Information
  content.push({
    text: 'Medical Practitioner Information',
    style: 'sectionTitle',
    margin: [0, 15, 0, 5] as [number, number, number, number],
  });

  const doctorInfo: Array<{ label: string; value: string }> = [
    { label: 'Name', value: submission.createdByName || '-' },
    { label: 'MCR Number', value: submission.createdByMcrNumber || '-' },
  ];

  content.push({
    table: {
      widths: ['30%', '70%'],
      body: doctorInfo.map(info => [
        { text: info.label, bold: true, fontSize: 10 },
        { text: info.value, fontSize: 10 },
      ]),
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 10] as [number, number, number, number],
  });

  return content;
}
