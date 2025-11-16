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

  // Fitness Determination Section
  content.push({
    text: 'Fitness Determination',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  // Determine which fitness questions are relevant
  const purpose = submission.purposeOfExam;
  const showMotorVehicleFitness = purpose === 'AGE_65_ABOVE_TP_ONLY';
  
  const showPsvFitness = 
    purpose === 'AGE_65_ABOVE_TP_LTA' || 
    purpose === 'AGE_64_BELOW_LTA_ONLY';
  
  const showBavlFitness = 
    purpose === 'AGE_65_ABOVE_TP_LTA' || 
    purpose === 'AGE_64_BELOW_LTA_ONLY' ||
    purpose === 'BAVL_ANY_AGE';

  const fitnessInfo: Array<{ label: string; value: string; show: boolean }> = [
    {
      label: 'Physically and mentally fit to drive a motor vehicle?',
      value: formData.fitToDriveMotorVehicle === 'yes' ? 'Yes' : 'No',
      show: showMotorVehicleFitness,
    },
    {
      label: 'Physically and mentally fit to drive a Public Service Vehicle (PSV)?',
      value: formData.fitToDrivePsv === 'yes' ? 'Yes' : 'No',
      show: showPsvFitness,
    },
    {
      label: 'Physically and mentally fit to hold a Bus Attendant\'s Vocational Licence (BAVL)?',
      value: formData.fitForBavl === 'yes' ? 'Yes' : 'No',
      show: showBavlFitness,
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

  return content;
}
