import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Edit } from 'lucide-react';

interface DrivingVocationalTpLtaSummaryProps {
  formData: Record<string, any>;
  patientInfo: {
    name: string;
    nric: string;
    dateOfBirth?: string;
    drivingLicenseClass?: string;
    email?: string;
    mobile?: string;
  };
  examinationDate: string;
  onEdit?: (section: string) => void;
  onChange?: (key: string, value: any) => void;
}

export function DrivingVocationalTpLtaSummary({
  formData,
  patientInfo,
  examinationDate,
  onEdit,
  onChange,
}: DrivingVocationalTpLtaSummaryProps) {
  const medicalDeclaration = formData.medicalDeclaration || {};
  const medicalHistory = formData.medicalHistory || {};
  const amt = formData.amt || {};
  const assessment = formData.assessment || {};

  // Helper to check if there are pending memos
  const hasPendingMemos = () => {
    const memoRequirements = formData.memoRequirements 
      ? (typeof formData.memoRequirements === 'string' 
          ? JSON.parse(formData.memoRequirements) 
          : formData.memoRequirements)
      : {};
    
    const checkedConditions = Object.entries(memoRequirements)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
    
    for (const conditionId of checkedConditions) {
      const memoProvided = formData[`memoProvided_${conditionId}`];
      const furtherMemoRequired = formData[`furtherMemoRequired_${conditionId}`];
      
      if (memoProvided === 'no' || (memoProvided === 'yes' && furtherMemoRequired === 'yes')) {
        return true;
      }
    }
    
    return false;
  };

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

  // Helper to get checked history items
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

  // Helper to get abnormalities
  const getAbnormalities = () => {
    const abnormalityChecklist = formData.abnormalityChecklist || {};
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
      alcoholDrugAddiction: 'Evidence of being addicted to the excessive use of alcohol or drug',
      psychiatricDisorder: 'Psychiatric disorder',
      cognitiveImpairment: 'Sign of cognitive impairment',
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
  const abnormalities = getAbnormalities();

  // Calculate age at examination
  const calculateAge = (dateOfBirth: string, examDate: string) => {
    const birth = new Date(dateOfBirth);
    const exam = new Date(examDate);
    let age = exam.getFullYear() - birth.getFullYear();
    const monthDiff = exam.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && exam.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const ageAtExamination = patientInfo.dateOfBirth 
    ? calculateAge(patientInfo.dateOfBirth, examinationDate) 
    : null;

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
                ⚠️ Cannot Submit - Pending Memo/Report Required
              </h4>
              <p className="text-sm text-red-700 mb-2">
                This report cannot be submitted because the patient has medical conditions that require additional memo/report to be provided.
              </p>
              <p className="text-sm text-red-700 font-medium">
                Please check the highlighted conditions in the "Medical Conditions Requiring Additional Memo/Report" section below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Patient Information</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('patient-info')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Patient Name</p>
              <p className="font-medium">{patientInfo.name}</p>
            </div>
            <div>
              <p className="text-slate-500">NRIC/FIN</p>
              <p className="font-medium">{patientInfo.nric}</p>
            </div>
            {patientInfo.dateOfBirth && (
              <div>
                <p className="text-slate-500">Date of Birth</p>
                <p className="font-medium">{new Date(patientInfo.dateOfBirth).toLocaleDateString()}</p>
              </div>
            )}
            {ageAtExamination !== null && (
              <div>
                <p className="text-slate-500">Age at Examination</p>
                <p className="font-medium">{ageAtExamination} years</p>
              </div>
            )}
            {patientInfo.drivingLicenseClass && (
              <div>
                <p className="text-slate-500">Class of Driving Licence</p>
                <p className="font-medium">{patientInfo.drivingLicenseClass}</p>
              </div>
            )}
            {patientInfo.email && (
              <div>
                <p className="text-slate-500">Email Address</p>
                <p className="font-medium">{patientInfo.email}</p>
              </div>
            )}
            {patientInfo.mobile && (
              <div>
                <p className="text-slate-500">Mobile Number</p>
                <p className="font-medium">{patientInfo.mobile}</p>
              </div>
            )}
            <div>
              <p className="text-slate-500">Examination Date</p>
              <p className="font-medium">{new Date(examinationDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Declaration by Patient */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Medical Declaration by Patient</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('medical-declaration')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3 italic">Conditions experienced in the past 6 months:</p>
          {checkedDeclarations.length > 0 ? (
            <>
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
            </>
          ) : (
            <p className="text-sm text-gray-600 italic">No conditions declared</p>
          )}
          
          {/* Patient Certification */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Declaration by Patient to Medical Practitioner</h4>
            <div className={`p-3 rounded-md ${medicalDeclaration.patientCertification ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              {medicalDeclaration.patientCertification ? (
                <>
                  <p className="text-green-700 font-medium mb-2">✓ Patient certification confirmed</p>
                  <p className="text-sm leading-relaxed mb-2">I hereby certify that:</p>
                  <ul className="space-y-1.5 ml-4 list-disc list-outside text-sm">
                    <li>I have explained this declaration to the patient</li>
                    <li>The patient has confirmed that he/she has carefully considered his/her responses and believe them to be complete and correct</li>
                    <li>The patient has declared to me that he/she has not withheld any relevant information or made any misleading statement</li>
                    <li>He/she has provided his/her consent for me, as the examining medical practitioner, to communicate with any physician who has previously attended to him/her</li>
                  </ul>
                </>
              ) : (
                <p className="text-gray-600 italic">Patient certification not completed</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History of Patient */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Medical History of Patient</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('medical-history')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          {checkedHistoryItems.length > 0 ? (
            <>
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
            </>
          ) : (
            <p className="text-sm text-gray-600 italic">No pre-existing conditions</p>
          )}
          
          {/* Patient Certification */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Declaration by Patient to Medical Practitioner</h4>
            <div className={`p-3 rounded-md ${medicalHistory.patientCertification ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              {medicalHistory.patientCertification ? (
                <>
                  <p className="text-green-700 font-medium mb-2">✓ Patient certification confirmed</p>
                  <p className="text-sm leading-relaxed mb-2">I hereby certify that:</p>
                  <ul className="space-y-1.5 ml-4 list-disc list-outside text-sm">
                    <li>I have explained this declaration to the patient</li>
                    <li>The patient has confirmed that he/she has carefully considered his/her responses and believe them to be complete and correct</li>
                    <li>The patient has declared to me that he/she has not withheld any relevant information or made any misleading statement</li>
                    <li>He/she has provided his/her consent for me, as the examining medical practitioner, to communicate with any physician who has previously attended to him/her</li>
                  </ul>
                </>
              ) : (
                <p className="text-gray-600 italic">Patient certification not completed</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Medical Examination */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">General Medical Examination</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('general-medical')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {/* Cardiovascular Assessment */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Cardiovascular Assessment</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Blood Pressure:</span>
                  <p className="font-medium">{formData.bloodPressure || '-'} mmHg</p>
                </div>
                <div>
                  <span className="text-gray-600">Pulse:</span>
                  <p className="font-medium">{formData.pulse || '-'} bpm</p>
                </div>
                <div>
                  <span className="text-gray-600">S1_S2 Reading:</span>
                  <p className="font-medium">{formData.s1S2Reading || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Murmurs:</span>
                  <p className="font-medium">{formData.murmurs || '-'}</p>
                </div>
              </div>
            </div>

            {/* Vision Assessment */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Vision Assessment</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Optical Aids:</span>
                  <p className="font-medium">{formData.opticalAids === 'yes' ? 'Yes' : formData.opticalAids === 'no' ? 'No' : '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Visual Acuity:</span>
                  <p className="font-medium">{formData.visualAcuity || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Near Vision:</span>
                  <p className="font-medium">
                    RE: {formData.nearVisionRE || '-'}, LE: {formData.nearVisionLE || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* General Condition */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">General Condition</h4>
              <div className="text-sm">
                <span className="text-gray-600">Pass General Condition:</span>
                <p className={`font-medium inline ml-2 ${formData.passGeneralCondition === 'yes' ? 'text-green-600' : formData.passGeneralCondition === 'no' ? 'text-red-600' : ''}`}>
                  {formData.passGeneralCondition === 'yes' ? '✓ Yes' : formData.passGeneralCondition === 'no' ? '✗ No' : '-'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Physical & Mental Health Assessment */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Physical & Mental Health Assessment</h4>
            {abnormalities.length > 0 ? (
              <ul className="list-disc ml-6 space-y-3 text-sm">
                {abnormalities.map((item, index) => (
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
            ) : (
              <p className="text-sm text-gray-600 italic">No abnormalities observed</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Abbreviated Mental Test (AMT) */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Abbreviated Mental Test (AMT)</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('amt')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          {formData.amtRequired === false ? (
            <div className="py-6">
              <p className="text-lg text-slate-600">AMT not required</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-gray-600">Result</p>
                  <p className={`text-2xl font-bold ${amt.score >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                    {amt.score >= 8 ? 'Pass' : 'Fail'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Score</p>
                  <p className="text-3xl font-bold text-blue-700">{amt.score || 0}/10</p>
                </div>
              </div>
              {amt.score < 8 && (
                <div className="bg-amber-100 border border-amber-300 rounded-md px-4 py-2">
                  <p className="text-sm font-medium text-amber-800">
                    ⚠️ A score of less than 7 suggests cognitive impairment and may require specialist referral for further diagnosis.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vocational Licence Medical Examination */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Vocational Licence Medical Examination</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('vocational-xray')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          
          {/* X-ray Examination Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">X-ray Examination</h4>
            <div className="space-y-2 text-sm pl-4">
              <div>
                <span className="text-gray-600">X-ray Required:</span>
                <p className="font-medium inline ml-2">
                  {formData.vocationalXrayRequired === 'yes' ? 'Yes' : formData.vocationalXrayRequired === 'no' ? 'No' : '-'}
                </p>
              </div>
              {formData.vocationalXrayRequired === 'yes' && (
                <>
                  <div>
                    <span className="text-gray-600">X-ray Findings:</span>
                    <p className="font-medium inline ml-2">
                      {formData.vocationalXrayFindings === 'no_lesion' 
                        ? 'No radiological evidence of chest lesion' 
                        : formData.vocationalXrayFindings === 'tb' 
                        ? 'Patient is suffering from TB' 
                        : '-'}
                    </p>
                  </div>
                  {formData.vocationalXrayRemarks && (
                    <div>
                      <span className="text-gray-600">Remarks:</span>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1 whitespace-pre-wrap">
                        {formData.vocationalXrayRemarks}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Medical Conditions Requiring Additional Memo/Report Section */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Medical Conditions Requiring Additional Memo/Report</h4>
            <div className="text-sm pl-4">
          {(() => {
            const memoRequirements = formData.memoRequirements 
              ? (typeof formData.memoRequirements === 'string' 
                  ? JSON.parse(formData.memoRequirements) 
                  : formData.memoRequirements)
              : {};
            
            const MEMO_LABELS: Record<string, string> = {
              amputee: 'Amputee',
              cancerChemoRadio: 'Cancer undergoing Chemotherapy or Radiotherapy',
              endStageRenal: 'End Stage Renal Failure on Hemodialysis',
              hearingProblems: 'Hearing problems',
              heartSurgeryPacemaker: 'Heart Surgery (with Pacemaker)',
              mentalIllness: 'Mental illness (e.g. Anxiety, Depression, Schizophrenia & Bipolar)',
              stroke: 'Stroke',
              tuberculosis: 'Tuberculosis',
            };

            const checkedConditions = Object.entries(memoRequirements)
              .filter(([_, value]) => value === true)
              .map(([key]) => key);

            if (checkedConditions.length === 0) return null;

            return (
              <div>
                {/* <p className="font-medium text-gray-700 mb-2">Medical Conditions Requiring Additional Memo/Report</p> */}
                <div className="space-y-3">
                  {checkedConditions.map((conditionId) => {
                    const memoProvided = formData[`memoProvided_${conditionId}`];
                    const furtherMemoRequired = formData[`furtherMemoRequired_${conditionId}`];
                    const remarks = formData[`memoRemarks_${conditionId}`];
                    
                    // Highlight if memo not provided OR further memo required
                    const needsAttention = memoProvided === 'no' || (memoProvided === 'yes' && furtherMemoRequired === 'yes');

                    return (
                      <div 
                        key={conditionId} 
                        className={`p-3 rounded border ${
                          needsAttention 
                            ? 'bg-red-50 border-red-300' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <p className="font-medium text-amber-700 mb-2">
                          {MEMO_LABELS[conditionId]}
                        </p>
                        <div className="ml-4 space-y-1 text-xs text-gray-700">
                          <div>
                            <span className="text-gray-600">Memo Provided by Patient:</span>
                            <span className={`ml-2 font-medium ${memoProvided === 'no' ? 'text-red-600' : ''}`}>
                              {memoProvided === 'yes' ? 'Yes' : memoProvided === 'no' ? 'No' : '-'}
                            </span>
                          </div>
                          {memoProvided === 'yes' && (
                            <>
                              <div>
                                <span className="text-gray-600">Further Memo Required:</span>
                                <span className={`ml-2 font-medium ${furtherMemoRequired === 'yes' ? 'text-red-600' : ''}`}>
                                  {furtherMemoRequired === 'yes' ? 'Yes' : furtherMemoRequired === 'no' ? 'No' : '-'}
                                </span>
                              </div>
                              {remarks && (
                                <div>
                                  <span className="text-gray-600">Remarks:</span>
                                  <p className="ml-2 mt-1 text-xs whitespace-pre-wrap">
                                    {remarks}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Result - Assessment */}
      <Card>
        <CardContent className="pt-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Overall Result of Medical Examination</h3>
        
        {/* Fit to Drive Public Service Vehicle Question */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Is the patient physically and mentally fit to drive a public service vehicle? <span className="text-red-500">*</span>
          </p>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="fitToDrivePublicService"
                value="true"
                checked={assessment.fitToDrivePublicService === true}
                onChange={() => {
                  if (onChange) {
                    onChange('assessment', { ...assessment, fitToDrivePublicService: true });
                  }
                }}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium">Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="fitToDrivePublicService"
                value="false"
                checked={assessment.fitToDrivePublicService === false}
                onChange={() => {
                  if (onChange) {
                    onChange('assessment', { ...assessment, fitToDrivePublicService: false });
                  }
                }}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium">No</span>
            </label>
          </div>
          {assessment.fitToDrivePublicService !== undefined && (
            <div className="mt-3">
              <p className={`font-bold text-lg ${assessment.fitToDrivePublicService ? 'text-green-600' : 'text-red-600'}`}>
                {assessment.fitToDrivePublicService ? '✓ YES - Patient is fit to drive a public service vehicle' : '✗ NO - Patient is not fit to drive a public service vehicle'}
              </p>
            </div>
          )}
        </div>

        {/* Bus Attendant Question - only show if not fit for public service vehicle */}
        {assessment.fitToDrivePublicService === false && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Is the patient fit to hold a Bus Attendant Vocational Licence? <span className="text-red-500">*</span>
            </p>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="fitForBusAttendant"
                  value="true"
                  checked={assessment.fitForBusAttendant === true}
                  onChange={() => {
                    if (onChange) {
                      onChange('assessment', { ...assessment, fitForBusAttendant: true });
                    }
                  }}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">Yes</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="fitForBusAttendant"
                  value="false"
                  checked={assessment.fitForBusAttendant === false}
                  onChange={() => {
                    if (onChange) {
                      onChange('assessment', { ...assessment, fitForBusAttendant: false });
                    }
                  }}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">No</span>
              </label>
            </div>
            {assessment.fitForBusAttendant !== undefined && (
              <div className="mt-3">
                <p className={`font-bold text-lg ${assessment.fitForBusAttendant ? 'text-green-600' : 'text-red-600'}`}>
                  {assessment.fitForBusAttendant ? '✓ YES - Patient is fit for Bus Attendant licence' : '✗ NO - Patient is not fit for Bus Attendant licence'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Medical Practitioner Declaration */}
        <div className="pt-4 border-t border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Medical Practitioner Declaration</h4>
          <label className="flex items-start space-x-3 cursor-pointer bg-white p-3 rounded border border-blue-300">
            <input
              type="checkbox"
              checked={assessment.declarationAgreed === true}
              onChange={(e) => {
                if (onChange) {
                  onChange('assessment', { ...assessment, declarationAgreed: e.target.checked });
                }
              }}
              className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="!text-sm !font-normal !leading-relaxed text-gray-700">
                I certify that I have examined and identified the patient named above: <span className="text-red-500">*</span>
              </p>
              <ul className="ml-6 mt-2 space-y-2 !text-sm !font-normal !leading-relaxed text-gray-700 list-disc">
                <li>He/she has presented his/her identity card, which bears the same name and identification number as on this form.</li>
                <li>The answers to the questions above are correct to the best of my knowledge.</li>
              </ul>
            </div>
          </label>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
