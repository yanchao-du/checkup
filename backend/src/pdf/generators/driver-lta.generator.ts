import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';

export function generateDriverLtaContent(submission: SubmissionData): Content[] {
  const formData = submission.formData;
  const assessment = formData.assessment || {};
  const content: Content[] = [];

  // Vocational Licence Medical Examination (LTA)
  content.push({
    text: 'Vocational Licence Medical Examination (LTA)',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  // X-ray Examination
  if (formData.vocationalXrayRequired) {
    content.push({
      text: 'X-ray Examination',
      fontSize: 10,
      bold: true,
      margin: [0, 5, 0, 3] as [number, number, number, number],
    });

    content.push({
      columns: [
        { text: 'X-ray Required:', fontSize: 10, width: '30%' },
        { text: formData.vocationalXrayRequired === 'yes' ? 'Yes' : formData.vocationalXrayRequired === 'no' ? 'No' : '-', fontSize: 10, width: '70%' },
      ],
      margin: [0, 2, 0, 2] as [number, number, number, number],
    });

    if (formData.vocationalXrayRequired === 'yes') {
      content.push({
        columns: [
          { text: 'X-ray Findings:', fontSize: 10, width: '30%' },
          { 
            text: formData.vocationalXrayFindings === 'no_lesion' 
              ? 'No radiological evidence of chest lesion' 
              : formData.vocationalXrayFindings === 'tb' 
              ? 'Patient is suffering from TB' 
              : '-',
            fontSize: 10,
            width: '70%',
            ...(formData.vocationalXrayFindings === 'tb' && { color: '#dc2626', bold: true }),
          },
        ],
        margin: [0, 2, 0, 2] as [number, number, number, number],
      });

      if (formData.vocationalXrayRemarks) {
        content.push({
          text: 'Remarks:',
          fontSize: 10,
          margin: [0, 5, 0, 2] as [number, number, number, number],
        });
        content.push({
          text: formData.vocationalXrayRemarks,
          fontSize: 9,
          color: '#475569',
          margin: [0, 0, 0, 5] as [number, number, number, number],
        });
      }
    }

    content.push({ text: '', margin: [0, 0, 0, 10] as [number, number, number, number] });
  }

  // Medical Conditions Requiring Additional Memo/Report
  content.push({
    text: 'Medical Conditions Requiring Additional Memo/Report',
    fontSize: 10,
    bold: true,
    margin: [0, 5, 0, 3] as [number, number, number, number],
  });

  const memoRequirements = formData.memoRequirements 
    ? (typeof formData.memoRequirements === 'string' ? JSON.parse(formData.memoRequirements) : formData.memoRequirements)
    : {};
  const memoFields = Object.keys(memoRequirements).filter(key => memoRequirements[key]);

  if (memoFields.length > 0) {
    memoFields.forEach((field) => {
      const memoProvided = formData[`memoProvided_${field}`];
      const furtherMemoRequired = formData[`furtherMemoRequired_${field}`];
      const memoRemarks = formData[`memoRemarks_${field}`] || '';

      content.push({
        text: field.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        fontSize: 10,
        color: '#d97706',
        margin: [0, 5, 0, 3] as [number, number, number, number],
      });

      content.push({
        columns: [
          { text: 'Memo Provided:', fontSize: 9, width: '30%' },
          { 
            text: memoProvided === 'yes' ? 'Yes' : 'No',
            fontSize: 9,
            width: '70%',
            color: memoProvided === 'yes' ? '#16a34a' : '#dc2626',
          },
        ],
        margin: [0, 2, 0, 2] as [number, number, number, number],
      });

      content.push({
        columns: [
          { text: 'Further Memo Required:', fontSize: 9, width: '30%' },
          { 
            text: furtherMemoRequired === 'yes' ? 'Yes' : 'No',
            fontSize: 9,
            width: '70%',
            color: furtherMemoRequired === 'yes' ? '#dc2626' : '#16a34a',
          },
        ],
        margin: [0, 2, 0, 2] as [number, number, number, number],
      });

      if (memoRemarks) {
        content.push({
          text: 'Remarks:',
          fontSize: 9,
          margin: [0, 3, 0, 1] as [number, number, number, number],
        });
        content.push({
          text: memoRemarks,
          fontSize: 9,
          color: '#475569',
          margin: [0, 0, 0, 5] as [number, number, number, number],
        });
      }
    });
  } else {
    content.push({
      text: 'Nil',
      fontSize: 10,
      color: '#64748b',
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });
  }

  // Overall Result
  content.push({
    text: 'Overall Result of Medical Examination',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  if (assessment.fitToDrivePublicService !== undefined) {
    content.push({
      text: 'Is the patient physically and mentally fit to drive a public service vehicle?',
      fontSize: 10,
      margin: [0, 0, 0, 5] as [number, number, number, number],
    });
    
    content.push({
      text: assessment.fitToDrivePublicService 
        ? 'YES - Patient is fit to drive a public service vehicle' 
        : 'NO - Patient is not fit to drive a public service vehicle',
      fontSize: 12,
      bold: true,
      color: assessment.fitToDrivePublicService ? '#16a34a' : '#dc2626',
      margin: [0, 0, 0, 15] as [number, number, number, number],
    });
  }

  if (assessment.fitForBusAttendant !== undefined) {
    content.push({
      text: 'Is the patient fit to hold a Bus Attendant Vocational Licence?',
      fontSize: 10,
      margin: [0, 0, 0, 5] as [number, number, number, number],
    });
    
    content.push({
      text: assessment.fitForBusAttendant 
        ? 'YES - Patient is fit to hold a Bus Attendant Vocational Licence' 
        : 'NO - Patient is not fit to hold a Bus Attendant Vocational Licence',
      fontSize: 12,
      bold: true,
      color: assessment.fitForBusAttendant ? '#16a34a' : '#dc2626',
      margin: [0, 0, 0, 15] as [number, number, number, number],
    });
  }

  return content;
}
