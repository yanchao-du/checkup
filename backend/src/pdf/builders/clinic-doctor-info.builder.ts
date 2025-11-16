import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';

export function buildClinicDoctorInfo(submission: SubmissionData): Content[] {
  const rows: any[] = [];

  // HCI Code
  if (submission.clinicHciCode) {
    rows.push([
      { text: 'HCI Code', style: 'tableCell', bold: true },
      { text: submission.clinicHciCode, style: 'tableCell' },
    ]);
  }

  // HCI Name (Clinic Name)
  if (submission.clinicName) {
    rows.push([
      { text: 'HCI Name', style: 'tableCell', bold: true },
      { text: submission.clinicName, style: 'tableCell' },
    ]);
  }

  // Clinic Contact Number
  if (submission.clinicPhone) {
    rows.push([
      { text: 'Clinic Contact Number', style: 'tableCell', bold: true },
      { text: submission.clinicPhone, style: 'tableCell' },
    ]);
  }

  // MCR Number
  if (submission.approvedByMcrNumber) {
    rows.push([
      { text: 'MCR Number', style: 'tableCell', bold: true },
      { text: submission.approvedByMcrNumber, style: 'tableCell' },
    ]);
  }

  // Doctor Name
  if (submission.approvedByName) {
    rows.push([
      { text: 'Doctor Name', style: 'tableCell', bold: true },
      { text: submission.approvedByName, style: 'tableCell' },
    ]);
  }

  return [
    {
      text: 'Clinic and Doctor Information',
      style: 'sectionTitle',
      margin: [0, 10, 0, 5] as [number, number, number, number],
    },
    {
      table: {
        widths: ['30%', '70%'],
        body: rows,
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
