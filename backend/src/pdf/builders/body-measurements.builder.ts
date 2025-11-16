import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';

function calculateBMI(height: number, weight: number): number {
  // height in cm, weight in kg
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function buildBodyMeasurements(submission: SubmissionData): Content[] {
  const formData = submission.formData;
  
  // Body measurements are not required for ICA, FMW, or driver exams
  const skipBodyMeasurements = 
    submission.examType.includes('ICA') || 
    submission.examType.includes('FMW') ||
    submission.examType.includes('DRIVING') ||
    submission.examType.includes('VOCATIONAL') ||
    submission.examType === 'AGED_DRIVERS';

  if (skipBodyMeasurements) {
    return [];
  }

  const hasMeasurements = formData.height || formData.weight || formData.bloodPressure || formData.pulse;
  
  if (!hasMeasurements) {
    return [];
  }

  // Calculate BMI if both height and weight are available
  let bmi: number | null = null;
  let bmiCategory: string | null = null;
  if (formData.height && formData.weight) {
    bmi = calculateBMI(parseFloat(formData.height), parseFloat(formData.weight));
    bmiCategory = getBMICategory(bmi);
  }

  const columns: any[] = [];

  if (formData.height) {
    columns.push({
      width: bmi ? '20%' : '25%',
      stack: [
        { text: 'Height', style: 'label' },
        { text: `${formData.height} cm`, style: 'value' },
      ],
    });
  }

  if (formData.weight) {
    columns.push({
      width: bmi ? '20%' : '25%',
      stack: [
        { text: 'Weight', style: 'label' },
        { text: `${formData.weight} kg`, style: 'value' },
      ],
    });
  }

  if (bmi !== null) {
    columns.push({
      width: '20%',
      stack: [
        { text: 'BMI', style: 'label' },
        { text: bmi.toFixed(1), style: 'value' },
      ],
    });
  }

  if (bmiCategory) {
    columns.push({
      width: '20%',
      stack: [
        { text: 'BMI Category', style: 'label' },
        { text: bmiCategory, style: 'value' },
      ],
    });
  }

  if (formData.bloodPressure) {
    columns.push({
      width: bmi ? '20%' : '25%',
      stack: [
        { text: 'Blood Pressure', style: 'label' },
        { text: `${formData.bloodPressure} mmHg`, style: 'value' },
      ],
    });
  }

  if (formData.pulse) {
    columns.push({
      width: bmi ? '20%' : '25%',
      stack: [
        { text: 'Pulse', style: 'label' },
        { text: `${formData.pulse} bpm`, style: 'value' },
      ],
    });
  }

  return [
    {
      text: 'Body Measurements',
      style: 'sectionTitle',
      margin: [0, 10, 0, 5] as [number, number, number, number],
    },
    {
      columns,
      margin: [0, 0, 0, 15] as [number, number, number, number],
    },
  ];
}
