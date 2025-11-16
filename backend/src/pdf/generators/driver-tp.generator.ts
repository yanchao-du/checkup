import { Content } from 'pdfmake/interfaces';
import { SubmissionData } from '../utils/types';

export function generateDriverTpContent(submission: SubmissionData): Content[] {
  const formData = submission.formData;
  const medicalDeclaration = formData.medicalDeclaration || {};
  const medicalHistory = formData.medicalHistory || {};
  const amt = formData.amt || {};
  const abnormalityChecklist = formData.abnormalityChecklist || {};
  const assessment = formData.assessment || {};
  const content: Content[] = [];

  // Medical Declaration by Patient
  content.push({
    text: 'Medical Declaration by Patient',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  const declarationLabels: Record<string, string> = {
    consultingPractitioner: 'Currently consulting a medical practitioner for a pre-existing or newly diagnosed medical condition',
    takingMedication: 'Currently taking medication for a pre-existing or newly diagnosed medical condition',
    hospitalAdmission: 'Recently warded in or discharged from hospital',
    rehabilitativeTreatment: 'Currently receiving or recently received rehabilitative treatment (for stroke patients)',
    driverRehabilitation: 'Has attended a driver rehabilitation and medical fitness assessment programme',
    otherMedicalProblems: 'Has any other relevant medical problems or injuries not mentioned above',
  };

  const checkedDeclarations: string[] = [];
  Object.entries(declarationLabels).forEach(([key, label]) => {
    if (medicalDeclaration[key]) {
      checkedDeclarations.push(label);
    }
  });

  if (checkedDeclarations.length > 0) {
    content.push({
      ul: checkedDeclarations.map(item => ({ text: item, fontSize: 10, color: '#d97706' })),
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });
    
    if (medicalDeclaration.remarks) {
      content.push({
        text: 'Remarks',
        fontSize: 10,
        bold: true,
        margin: [0, 5, 0, 3] as [number, number, number, number],
      });
      content.push({
        text: medicalDeclaration.remarks,
        fontSize: 9,
        margin: [0, 0, 0, 10] as [number, number, number, number],
      });
    }
  } else {
    content.push({
      text: 'No conditions declared',
      fontSize: 10,
      italics: true,
      color: '#64748b',
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });
  }

  // Medical History of Patient
  content.push({
    text: 'Medical History of Patient',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  const historyLabels: Record<string, string> = {
    arthritisJointDisease: 'Arthritis / joint disease / numbness in hands and fingers',
    asthmaBronchitisCopd: 'Asthma / bronchitis / COPD',
    chestPain: 'Chest pain on exertion or at night',
    deafness: 'Deafness',
    diabetes: 'Diabetes',
    difficultySeeing: 'Difficulty seeing in the dark',
    epilepsySeizuresFaints: 'Epilepsy, seizures or fits of any kind / faints',
    eyeTrouble: 'Eye trouble of any kind (e.g. cataracts, glaucoma, strabismus)',
    headachesMigraine: 'Severe headaches or migraine',
    headInjuryConcussion: 'Head injury or concussion',
    heartAttackDisease: 'Heart attack / disease',
    highBloodPressure: 'High blood pressure',
    muscleDiseaseWeakness: 'Muscle disease or weakness',
    palpitationsBreathlessness: 'Palpitations or breathlessness',
    psychiatricIllness: 'Psychiatric illness',
    strokeTia: 'Stroke / TIA',
    surgicalOperations: 'Surgical operations',
    thyroidDisease: 'Thyroid disease',
    otherRelevant: 'Any relevant medical problems or injuries not mentioned above',
  };

  const checkedHistory: Array<{ label: string; remarks?: string }> = [];
  Object.entries(historyLabels).forEach(([key, label]) => {
    if (medicalHistory[key]) {
      const remarks = medicalHistory[`${key}Remarks`];
      checkedHistory.push({ label, remarks });
    }
  });

  if (checkedHistory.length > 0) {
    checkedHistory.forEach((item) => {
      content.push({
        text: `• ${item.label}`,
        fontSize: 10,
        color: '#d97706',
        margin: [0, 2, 0, 2] as [number, number, number, number],
      });
      if (item.remarks) {
        content.push({
          text: `  Remarks: ${item.remarks}`,
          fontSize: 9,
          color: '#475569',
          margin: [15, 0, 0, 5] as [number, number, number, number],
        });
      }
    });
    content.push({ text: '', margin: [0, 0, 0, 10] as [number, number, number, number] });
  } else {
    content.push({
      text: 'No declared medical conditions',
      fontSize: 10,
      italics: true,
      color: '#64748b',
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });
  }

  // General Medical Examination
  content.push({
    text: 'General Medical Examination',
    style: 'sectionTitle',
    margin: [0, 10, 0, 5] as [number, number, number, number],
  });

  // Cardiovascular Assessment
  content.push({
    text: 'Cardiovascular Assessment',
    fontSize: 10,
    bold: true,
    margin: [0, 5, 0, 3] as [number, number, number, number],
  });

  const systolic = formData.systolic;
  const diastolic = formData.diastolic;
  const bloodPressure = (systolic && diastolic) ? `${systolic}/${diastolic}` : (formData.bloodPressure || '-');

  content.push({
    columns: [
      { text: 'Blood Pressure:', fontSize: 10, width: '30%' },
      { text: `${bloodPressure} mmHg`, fontSize: 10, width: '70%' },
    ],
    margin: [0, 2, 0, 2] as [number, number, number, number],
  });

  content.push({
    columns: [
      { text: 'Pulse:', fontSize: 10, width: '30%' },
      { text: `${formData.pulse || '-'} bpm`, fontSize: 10, width: '70%' },
    ],
    margin: [0, 2, 0, 2] as [number, number, number, number],
  });

  content.push({
    columns: [
      { text: 'S1_S2 Reading:', fontSize: 10, width: '30%' },
      { 
        text: formData.s1S2Reading === 'Normal' ? 'Normal' : formData.s1S2Reading === 'Abnormal' ? 'Abnormal' : '-', 
        fontSize: 10, 
        width: '70%',
        ...(formData.s1S2Reading === 'Abnormal' && { color: '#dc2626', bold: true }),
      },
    ],
    margin: [0, 2, 0, 2] as [number, number, number, number],
  });

  content.push({
    columns: [
      { text: 'Murmurs:', fontSize: 10, width: '30%' },
      { 
        text: formData.murmurs === 'Yes' ? 'Yes' : formData.murmurs === 'No' ? 'No' : '-', 
        fontSize: 10, 
        width: '70%',
        ...(formData.murmurs === 'Yes' && { color: '#dc2626', bold: true }),
      },
    ],
    margin: [0, 2, 0, 10] as [number, number, number, number],
  });

  // Vision Assessment
  content.push({
    text: 'Vision Assessment',
    fontSize: 10,
    bold: true,
    margin: [0, 5, 0, 3] as [number, number, number, number],
  });

  content.push({
    columns: [
      { text: 'Optical Aids:', fontSize: 10, width: '30%' },
      { text: formData.opticalAids === 'yes' ? 'Yes' : formData.opticalAids === 'no' ? 'No' : '-', fontSize: 10, width: '70%' },
    ],
    margin: [0, 2, 0, 2] as [number, number, number, number],
  });

  content.push({
    columns: [
      { text: 'Visual Acuity:', fontSize: 10, width: '30%' },
      { text: formData.visualAcuity || '-', fontSize: 10, width: '70%' },
    ],
    margin: [0, 2, 0, 2] as [number, number, number, number],
  });

  content.push({
    columns: [
      { text: 'Near Vision:', fontSize: 10, width: '30%' },
      { text: `RE: ${formData.nearVisionRE || '-'}, LE: ${formData.nearVisionLE || '-'}`, fontSize: 10, width: '70%' },
    ],
    margin: [0, 2, 0, 10] as [number, number, number, number],
  });

  // General Condition
  content.push({
    text: 'General Condition',
    fontSize: 10,
    bold: true,
    margin: [0, 5, 0, 3] as [number, number, number, number],
  });

  content.push({
    columns: [
      { text: 'Pass General Condition:', fontSize: 10, width: '30%' },
      { 
        text: formData.passGeneralCondition === 'yes' ? 'Yes' : formData.passGeneralCondition === 'no' ? 'No' : '-', 
        fontSize: 10, 
        width: '70%',
        ...(formData.passGeneralCondition === 'yes' ? { color: '#16a34a', bold: true } : formData.passGeneralCondition === 'no' ? { color: '#dc2626', bold: true } : {}),
      },
    ],
    margin: [0, 2, 0, 10] as [number, number, number, number],
  });

  // Physical & Mental Health Assessment
  content.push({
    text: 'Physical & Mental Health Assessment',
    fontSize: 10,
    bold: true,
    margin: [0, 5, 0, 3] as [number, number, number, number],
  });

  const abnormalityLabels: Record<string, string> = {
    abdomen: 'Abdomen abnormality',
    abnormalityJointMovement: 'Abnormality or limitation in range of movement of the joints',
    defectInHearing: 'Defect in hearing',
    deformitiesPhysicalDisabilities: 'Deformities and/or physical disabilities observed',
    colourPerception: 'Difficulty in accurately recognising the colours red, green and amber',
    fingerNoseCoordination: 'Finger-nose coordination abnormality',
    limitationLimbStrength: 'Limitation in strength of upper limbs and lower limbs',
    lungs: 'Lungs abnormality',
    nervousSystem: 'Nervous system abnormality',
    neuroMuscularSystem: 'Neuro-muscular system abnormality',
    psychiatricDisorder: 'Psychiatric disorder observed',
    alcoholDrugAddiction: 'Signs of alcohol or drug addiction',
    cognitiveImpairment: 'Cognitive impairment',
  };

  const abnormalities: Array<{ label: string; remarks?: string }> = [];
  Object.entries(abnormalityLabels).forEach(([key, label]) => {
    if (abnormalityChecklist[key]) {
      const remarks = abnormalityChecklist[`${key}Remarks`];
      abnormalities.push({ label, remarks });
    }
  });

  if (abnormalities.length > 0) {
    abnormalities.forEach((item) => {
      content.push({
        text: `• ${item.label}`,
        fontSize: 10,
        color: '#dc2626',
        margin: [0, 2, 0, 2] as [number, number, number, number],
      });
      if (item.remarks) {
        content.push({
          text: `  Remarks: ${item.remarks}`,
          fontSize: 9,
          color: '#475569',
          margin: [15, 0, 0, 5] as [number, number, number, number],
        });
      }
    });
    content.push({ text: '', margin: [0, 0, 0, 10] as [number, number, number, number] });
  } else {
    content.push({
      text: 'No abnormalities observed',
      fontSize: 10,
      italics: true,
      color: '#64748b',
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });
  }

  // Abbreviated Mental Test (AMT)
  if (formData.amtRequired === false || formData.amtRequired === 'false') {
    content.push({
      text: 'Abbreviated Mental Test (AMT)',
      style: 'sectionTitle',
      margin: [0, 10, 0, 5] as [number, number, number, number],
    });
    content.push({
      text: 'AMT not required',
      fontSize: 10,
      color: '#64748b',
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });
  } else if (amt.score !== undefined) {
    content.push({
      text: 'Abbreviated Mental Test (AMT)',
      style: 'sectionTitle',
      margin: [0, 10, 0, 5] as [number, number, number, number],
    });
    
    const amtScore = Number(amt.score);
    const amtPassed = amtScore >= 8;
    
    content.push({
      columns: [
        {
          width: '50%',
          text: [
            { text: 'Result: ', fontSize: 10 },
            { 
              text: amtPassed ? 'Pass' : 'Fail', 
              fontSize: 14, 
              bold: true, 
              color: amtPassed ? '#16a34a' : '#dc2626' 
            },
          ],
        },
        {
          width: '50%',
          text: [
            { text: 'Score: ', fontSize: 10 },
            { text: `${amt.score}/10`, fontSize: 14, bold: true },
          ],
        },
      ],
      margin: [0, 0, 0, 10] as [number, number, number, number],
    });

    if (!amtPassed) {
      content.push({
        text: 'A score of less than 7 suggests cognitive impairment and may require specialist referral for further diagnosis.',
        fontSize: 9,
        color: '#92400e',
        background: '#fef3c7',
        margin: [0, 5, 0, 10] as [number, number, number, number],
      });
    }
  }

  // Overall Result
  if (assessment) {
    content.push({
      text: 'Overall Result of Medical Examination',
      style: 'sectionTitle',
      margin: [0, 10, 0, 5] as [number, number, number, number],
    });

    if (assessment.fitToDrive !== undefined) {
      content.push({
        text: 'Is the patient physically and mentally fit to drive a motor vehicle?',
        fontSize: 10,
        margin: [0, 0, 0, 5] as [number, number, number, number],
      });
      
      content.push({
        text: assessment.fitToDrive 
          ? 'YES - Patient is fit to drive a motor vehicle' 
          : 'NO - Patient is not fit to drive a motor vehicle',
        fontSize: 12,
        bold: true,
        color: assessment.fitToDrive ? '#16a34a' : '#dc2626',
        margin: [0, 0, 0, 15] as [number, number, number, number],
      });
    }
  }

  return content;
}
