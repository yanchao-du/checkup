import { MedicalSubmission } from '@/types/api';

interface DrivingVocationalTpLtaDetailsProps {
  submission: MedicalSubmission;
}

export function DrivingVocationalTpLtaDetails({ submission }: DrivingVocationalTpLtaDetailsProps) {
  const data = submission.formData as Record<string, any>;
  const medicalDeclaration = data.medicalDeclaration || {};
  const medicalHistory = data.medicalHistory || {};
  const amt = data.amt || {};
  const abnormalityChecklist = data.abnormalityChecklist || {};
  const ltaVocational = data.ltaVocational || {};
  const assessment = data.assessment || {};

  // Helper to get checked declaration items
  const getCheckedDeclarations = () => {
    const items: string[] = [];
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
        items.push(label);
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

  // Helper to check if there are pending memos
  const hasPendingMemos = () => {
    const memoRequirements = data.memoRequirements 
      ? (typeof data.memoRequirements === 'string' 
          ? JSON.parse(data.memoRequirements) 
          : data.memoRequirements)
      : {};
    
    const checkedConditions = Object.entries(memoRequirements)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
    
    for (const conditionId of checkedConditions) {
      const memoProvided = data[`memoProvided_${conditionId}`];
      const furtherMemoRequired = data[`furtherMemoRequired_${conditionId}`];
      
      if (memoProvided === 'no' || (memoProvided === 'yes' && furtherMemoRequired === 'yes')) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Warning for pending memos */}
      {hasPendingMemos() && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-red-800 mb-2">
                ⚠️ Pending Memo/Report Required
              </h4>
              <p className="text-sm text-red-700 mb-2">
                This report has medical conditions that require additional memo/report to be provided before it can be submitted.
              </p>
              <p className="text-sm text-red-700 font-medium">
                Please check the highlighted conditions in the "Medical Conditions Requiring Additional Memo/Report" section below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Medical Declaration by Patient */}
      {checkedDeclarations.length > 0 && (
        <div className="bg-white border-2 border-amber-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-3 text-amber-900 bg-amber-50 -mx-6 -mt-6 px-6 py-3 rounded-t-lg border-b-2 border-amber-200">Medical Declaration by Patient</h3>
          <p className="text-sm text-gray-600 mb-3 italic">Conditions experienced in the past 6 months:</p>
          <ul className="list-disc ml-6 space-y-1 text-sm mb-4">
            {checkedDeclarations.map((item, index) => (
              <li key={index} className="text-amber-700">{item}</li>
            ))}
          </ul>
          
          {/* Remarks */}
          {medicalDeclaration.remarks && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Remarks</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                {medicalDeclaration.remarks}
              </p>
            </div>
          )}

          {/* Patient Certification */}
          {medicalDeclaration.patientCertification && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Declaration by Patient to Medical Practitioner</h4>
              <div className="p-3 rounded-md bg-green-50 border border-green-200">
                <p className="text-green-700 font-medium mb-2">✓ Patient certification confirmed</p>
                <p className="text-sm leading-relaxed mb-2">I hereby certify that:</p>
                <ul className="space-y-1.5 ml-4 list-disc list-outside text-sm">
                  <li>I have explained this declaration to the patient</li>
                  <li>The patient has confirmed that he/she has carefully considered his/her responses and believe them to be complete and correct</li>
                  <li>The patient has declared to me that he/she has not withheld any relevant information or made any misleading statement</li>
                  <li>He/she has provided his/her consent for me, as the examining medical practitioner, to communicate with any physician who has previously attended to him/her</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Medical History of Patient */}
      {checkedHistoryItems.length > 0 && (
        <div className="bg-white border-2 border-amber-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-3 text-amber-900 bg-amber-50 -mx-6 -mt-6 px-6 py-3 rounded-t-lg border-b-2 border-amber-200">Medical History of Patient</h3>
          <ul className="list-disc ml-6 space-y-3 text-sm mb-4">
            {checkedHistoryItems.map((item, index) => (
              <li key={index} className="text-amber-700">
                <div>
                  <div className="font-medium">{item.label}</div>
                  {item.remarks && (
                    <div className="mt-1 ml-0 text-gray-700 bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                      <span className="font-semibold">Remarks: </span>{item.remarks}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Patient Certification */}
          {medicalHistory.patientCertification && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Declaration by Patient to Medical Practitioner</h4>
              <div className="p-3 rounded-md bg-green-50 border border-green-200">
                <p className="text-green-700 font-medium mb-2">✓ Patient certification confirmed</p>
                <p className="text-sm leading-relaxed mb-2">I hereby certify that:</p>
                <ul className="space-y-1.5 ml-4 list-disc list-outside text-sm">
                  <li>I have explained this declaration to the patient</li>
                  <li>The patient has confirmed that he/she has carefully considered his/her responses and believe them to be complete and correct</li>
                  <li>The patient has declared to me that he/she has not withheld any relevant information or made any misleading statement</li>
                  <li>He/she has provided his/her consent for me, as the examining medical practitioner, to communicate with any physician who has previously attended to him/her</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* General Medical Examination */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 text-blue-900 bg-blue-50 -mx-6 -mt-6 px-6 py-3 rounded-t-lg border-b-2 border-blue-200">General Medical Examination</h3>
        
        {/* Cardiovascular Assessment */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Cardiovascular Assessment</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Blood Pressure:</span>
              <p className="font-medium">
                {data.systolic && data.diastolic 
                  ? `${data.systolic}/${data.diastolic}` 
                  : data.bloodPressure || '-'} mmHg
              </p>
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

        {/* Physical & Mental Health Assessment */}
        {abnormalityItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Physical & Mental Health Assessment</h4>
            <ul className="list-disc ml-6 space-y-3 text-sm">
              {abnormalityItems.map((item, index) => (
                <li key={index} className="text-red-700">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    {item.remarks && (
                      <div className="mt-1 ml-0 text-gray-700 bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                        <span className="font-semibold">Remarks: </span>{item.remarks}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Abbreviated Mental Test (AMT) */}
      {amt.score !== undefined && (
        <div className="bg-white border-2 border-purple-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 text-purple-900 bg-purple-50 -mx-6 -mt-6 px-6 py-3 rounded-t-lg border-b-2 border-purple-200">Abbreviated Mental Test (AMT)</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-gray-600">Result</p>
                <p className={`text-2xl font-bold ${Number(amt.score) >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(amt.score) >= 8 ? 'Pass' : 'Fail'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold">{amt.score}/10</p>
              </div>
            </div>
            {Number(amt.score) < 8 && (
              <div className="bg-amber-100 border border-amber-300 rounded-md px-4 py-2">
                <p className="text-sm font-medium text-amber-800">
                  ⚠️ A score of less than 7 suggests cognitive impairment and may require specialist referral for further diagnosis.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vocational Licence Medical Examination (LTA) */}
      {ltaVocational && Object.keys(ltaVocational).length > 0 && (
        <div className="bg-white border-2 border-indigo-200 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-0 text-indigo-900 bg-indigo-50 px-6 py-4 rounded-t-lg border-b-2 border-indigo-200">Vocational Licence Medical Examination (LTA)</h3>
          <div className="p-6 space-y-4">
            {/* X-ray Requirements */}
            {(ltaVocational.xrayRequired !== undefined || ltaVocational.xrayDate) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">X-ray Requirements</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">X-ray Required:</span>
                    <p className={`font-medium ${ltaVocational.xrayRequired ? 'text-red-600' : 'text-green-600'}`}>
                      {ltaVocational.xrayRequired ? 'Yes' : 'No'}
                    </p>
                  </div>
                  {ltaVocational.xrayDate && (
                    <div>
                      <span className="text-gray-600">X-ray Date:</span>
                      <p className="font-medium">{new Date(ltaVocational.xrayDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Memo Requirements */}
            {(ltaVocational.furtherMemoRequired !== undefined || ltaVocational.memoProvided !== undefined) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Memo Requirements</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Further Memo Required:</span>
                    <p className={`font-medium ${ltaVocational.furtherMemoRequired ? 'text-red-600' : 'text-green-600'}`}>
                      {ltaVocational.furtherMemoRequired ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Memo Provided:</span>
                    <p className={`font-medium ${!ltaVocational.memoProvided ? 'text-red-600' : 'text-green-600'}`}>
                      {ltaVocational.memoProvided ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
                {ltaVocational.memoRemarks && (
                  <div className="mt-2">
                    <span className="text-gray-600 text-sm">Remarks:</span>
                    <p className="font-medium text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded border mt-1">
                      {ltaVocational.memoRemarks}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Result of Medical Examination */}
      {assessment && (
        <div className="bg-white border-2 border-green-300 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-0 text-green-900 bg-green-50 px-6 py-4 rounded-t-lg border-b-2 border-green-300">Overall Result of Medical Examination</h3>
          
          <div className="p-6">
          {/* Fit to Drive Public Service Vehicle */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Is the patient physically and mentally fit to drive a public service vehicle?
            </p>
            {assessment.fitToDrivePublicService !== undefined && (
              <div className="mt-3">
                <p className={`font-bold text-lg ${assessment.fitToDrivePublicService ? 'text-green-600' : 'text-red-600'}`}>
                  {assessment.fitToDrivePublicService ? '✓ YES - Patient is fit to drive a public service vehicle' : '✗ NO - Patient is not fit to drive a public service vehicle'}
                </p>
              </div>
            )}
          </div>

          {/* Bus Attendant Licence (conditional) */}
          {assessment.fitToDrivePublicService === false && assessment.fitForBusAttendant !== undefined && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Is the patient fit to hold a Bus Attendant Vocational Licence?
              </p>
              <div className="mt-3">
                <p className={`font-bold text-lg ${assessment.fitForBusAttendant ? 'text-green-600' : 'text-red-600'}`}>
                  {assessment.fitForBusAttendant ? '✓ YES - Patient is fit for Bus Attendant licence' : '✗ NO - Patient is not fit for Bus Attendant licence'}
                </p>
              </div>
            </div>
          )}

          {/* Medical Practitioner Declaration */}
          {assessment.declarationAgreed && (
            <div className="pt-4 border-t border-green-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Medical Practitioner Declaration</h4>
              <div className="bg-green-50 p-3 rounded border border-green-300">
                <p className="text-green-700 font-medium mb-2">✓ Declaration confirmed</p>
                <p className="text-sm leading-relaxed text-gray-700">
                  I certify that I have examined and identified the patient named above:
                </p>
                <ul className="ml-6 mt-2 space-y-2 text-sm leading-relaxed text-gray-700 list-disc">
                  <li>He/she has presented his/her identity card, which bears the same name and identification number as on this form.</li>
                  <li>The answers to the questions above are correct to the best of my knowledge.</li>
                </ul>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
