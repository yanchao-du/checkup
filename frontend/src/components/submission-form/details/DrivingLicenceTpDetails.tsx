import { MedicalSubmission } from '@/types/api';

interface DrivingLicenceTpDetailsProps {
  submission: MedicalSubmission;
}

export function DrivingLicenceTpDetails({ submission }: DrivingLicenceTpDetailsProps) {
  const data = submission.formData as Record<string, any>;
  const medicalDeclaration = data.medicalDeclaration || {};
  const medicalHistory = data.medicalHistory || {};
  const amt = data.amt || {};
  const abnormalityChecklist = data.abnormalityChecklist || {};

  // Helper to get checked declaration items with remarks
  const getCheckedDeclarations = () => {
    const items: Array<{ label: string; remarks?: string }> = [];
    const labels: Record<string, string> = {
      consultingPractitioner: 'Currently consulting a medical practitioner for a pre-existing or newly diagnosed medical condition',
      takingMedication: 'Currently taking medication for a pre-existing or newly diagnosed medical condition',
      hospitalAdmission: 'Recently warded in or discharged from hospital',
      rehabilitativeTreatment: 'Currently receiving or recently received rehabilitative treatment (for stroke patients)',
      driverRehabilitation: 'Has attended a driver rehabilitation and medical fitness assessment programme',
      otherMedicalProblems: 'Has any other relevant medical problems or injuries not mentioned above',
    };

    Object.entries(labels).forEach(([key, label]) => {
      if (medicalDeclaration[key]) {
        const remarks = medicalDeclaration[`${key}Remarks`];
        items.push({ label, remarks });
      }
    });

    return items;
  };

  // Helper to get checked history items with remarks
  const getCheckedHistory = () => {
    const items: Array<{ label: string; remarks?: string }> = [];
    const labels: Record<string, string> = {
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

    Object.entries(labels).forEach(([key, label]) => {
      if (medicalHistory[key]) {
        const remarks = medicalHistory[`${key}Remarks`];
        items.push({ label, remarks });
      }
    });

    return items;
  };

  // Helper to get abnormalities with remarks
  const getAbnormalities = () => {
    const items: Array<{ label: string; remarks?: string }> = [];
    const labels: Record<string, string> = {
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

    Object.entries(labels).forEach(([key, label]) => {
      if (abnormalityChecklist[key]) {
        const remarks = abnormalityChecklist[`${key}Remarks`];
        items.push({ label, remarks });
      }
    });

    return items;
  };

  const checkedDeclarations = getCheckedDeclarations();
  const checkedHistoryItems = getCheckedHistory();
  const abnormalityItems = getAbnormalities();

  return (
    <div className="space-y-6">
      {/* Medical Declaration */}
      {checkedDeclarations.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3 border-b pb-2">Medical Declaration</h3>
          <ul className="space-y-3 text-sm">
            {checkedDeclarations.map((item, index) => (
              <li key={index} className="ml-6">
                <div className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <div className="flex-1">
                    <p>{item.label}</p>
                    {item.remarks && (
                      <p className="text-gray-600 italic mt-1 ml-4">Remarks: {item.remarks}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {medicalDeclaration.patientCertification && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                ✓ I hereby certify that I have fully and truthfully provided the above medical history
              </p>
            </div>
          )}
        </div>
      )}

      {/* Medical History */}
      {checkedHistoryItems.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3 border-b pb-2">Medical History</h3>
          <ul className="space-y-3 text-sm">
            {checkedHistoryItems.map((item, index) => (
              <li key={index} className="ml-6">
                <div className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <div className="flex-1">
                    <p>{item.label}</p>
                    {item.remarks && (
                      <p className="text-gray-600 italic mt-1 ml-4">Remarks: {item.remarks}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* General Medical Examination */}
      <div>
        <h3 className="font-semibold text-lg mb-3 border-b pb-2">General Medical Examination</h3>
        
        {/* Cardiovascular Assessment */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Cardiovascular Assessment</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Blood Pressure:</span>
              <p className="font-medium">{data.bloodPressure || '-'} mmHg</p>
            </div>
            <div>
              <span className="text-gray-600">Pulse:</span>
              <p className="font-medium">{data.pulse || '-'} bpm</p>
            </div>
            <div>
              <span className="text-gray-600">S1_S2 Reading:</span>
              <p className="font-medium">{data.s1S2Reading || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Murmurs:</span>
              <p className="font-medium">{data.murmurs || '-'}</p>
            </div>
          </div>
        </div>

        {/* Vision Assessment */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Vision Assessment</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Optical Aids:</span>
              <p className="font-medium">{data.opticalAids === 'yes' ? 'Yes' : data.opticalAids === 'no' ? 'No' : '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Visual Acuity:</span>
              <p className="font-medium">{data.visualAcuity || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Near Vision:</span>
              <p className="font-medium">
                RE: {data.nearVisionRE || '-'}, LE: {data.nearVisionLE || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* General Condition */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">General Condition</h4>
          <div className="text-sm">
            <span className="text-gray-600">Pass General Condition:</span>
            <p className={`font-medium inline ml-2 ${data.passGeneralCondition === 'yes' ? 'text-green-600' : data.passGeneralCondition === 'no' ? 'text-red-600' : ''}`}>
              {data.passGeneralCondition === 'yes' ? '✓ Yes' : data.passGeneralCondition === 'no' ? '✗ No' : '-'}
            </p>
          </div>
        </div>

        {/* Abnormalities */}
        {abnormalityItems.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Physical & Mental Health Assessment - Abnormalities Found</h4>
            <ul className="space-y-3 text-sm">
              {abnormalityItems.map((item, index) => (
                <li key={index} className="ml-6">
                  <div className="flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    <div className="flex-1">
                      <p>{item.label}</p>
                      {item.remarks && (
                        <p className="text-gray-600 italic mt-1 ml-4">Remarks: {item.remarks}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AMT Assessment */}
      {amt.score !== undefined && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-lg mb-3">Abbreviated Mental Test (AMT)</h3>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Score</p>
                <p className="text-4xl font-bold text-blue-700">{amt.score || 0}/10</p>
                <p className={`text-lg font-semibold mt-2 ${Number(amt.score) >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(amt.score) >= 8 ? '✓ Pass' : '✗ Fail'}
                </p>
              </div>
              {Number(amt.score) < 8 && (
                <div className="bg-amber-100 border border-amber-300 rounded-md px-4 py-2">
                  <p className="text-sm font-medium text-amber-800">
                    ⚠️ Score less than 8 may indicate cognitive impairment
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Medical Practitioner Declaration */}
      {medicalDeclaration.practitionerCertification && (
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
          <h3 className="font-semibold text-lg mb-3">Medical Practitioner Declaration</h3>
          <div className="text-sm">
            <p className="text-gray-700">
              ✓ I certify that I have examined the person named above and in my opinion he/she{' '}
              <span className="font-semibold">
                {data.passGeneralCondition === 'yes' 
                  ? 'is physically and mentally fit' 
                  : 'is NOT physically and mentally fit'
                }
              </span>
              {' '}to have charge of a motor vehicle.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
