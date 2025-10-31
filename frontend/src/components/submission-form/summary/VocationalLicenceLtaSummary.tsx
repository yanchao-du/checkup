interface VocationalLicenceLtaSummaryProps {
  formData: Record<string, any>;
  patientInfo: {
    name: string;
    nric: string;
    dateOfBirth?: string;
  };
  examinationDate: string;
}

export function VocationalLicenceLtaSummary({
  formData,
  patientInfo,
  examinationDate,
}: VocationalLicenceLtaSummaryProps) {
  const medicalDeclaration = formData.medicalDeclaration || {};
  const medicalHistory = formData.medicalHistory || {};
  const ltaVocational = formData.ltaVocational || {};
  const assessment = formData.assessment || {};

  // Helper to get checked declaration items
  const getCheckedDeclarations = () => {
    const items = [];
    const labels: Record<string, string> = {
      lossOfConsciousness: 'Loss of consciousness/fainting',
      seizures: 'Seizures or fits',
      suddenDizziness: 'Sudden dizziness or blackouts',
      chestPain: 'Chest pain or discomfort',
      breathlessness: 'Breathlessness during mild exertion',
      substanceAbuse: 'Alcohol or substance abuse',
      psychiatricCondition: 'Psychiatric condition requiring treatment',
    };

    Object.entries(labels).forEach(([key, label]) => {
      if (medicalDeclaration[key]) {
        items.push(label);
      }
    });

    if (medicalDeclaration.otherConditions) {
      items.push(`Other: ${medicalDeclaration.otherConditions}`);
    }

    return items;
  };

  // Helper to get checked history items
  const getCheckedHistory = () => {
    const items = [];
    const labels: Record<string, string> = {
      cardiovascular: 'Cardiovascular disease',
      neurological: 'Neurological disorder',
      psychiatric: 'Psychiatric condition',
      diabetes: 'Diabetes mellitus',
      vision: 'Vision problems',
      hearing: 'Hearing problems',
      musculoskeletal: 'Musculoskeletal disorder',
    };

    Object.entries(labels).forEach(([key, label]) => {
      if (medicalHistory[key]) {
        items.push(label);
      }
    });

    if (medicalHistory.other) {
      items.push(`Other: ${medicalHistory.other}`);
    }

    return items;
  };

  const checkedDeclarations = getCheckedDeclarations();
  const checkedHistoryItems = getCheckedHistory();

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Patient Information</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <p className="font-medium">{patientInfo.name}</p>
          </div>
          <div>
            <span className="text-gray-600">NRIC/FIN:</span>
            <p className="font-medium">{patientInfo.nric}</p>
          </div>
          {patientInfo.dateOfBirth && (
            <div>
              <span className="text-gray-600">Date of Birth:</span>
              <p className="font-medium">{new Date(patientInfo.dateOfBirth).toLocaleDateString()}</p>
            </div>
          )}
          <div>
            <span className="text-gray-600">Examination Date:</span>
            <p className="font-medium">{new Date(examinationDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* General Medical Examination */}
      <div>
        <h3 className="font-semibold text-lg mb-3">General Medical Examination</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Height:</span>
            <p className="font-medium">{formData.height || '-'} cm</p>
          </div>
          <div>
            <span className="text-gray-600">Weight:</span>
            <p className="font-medium">{formData.weight || '-'} kg</p>
          </div>
          <div>
            <span className="text-gray-600">BMI:</span>
            <p className="font-medium">
              {formData.height && formData.weight
                ? ((formData.weight / ((formData.height / 100) ** 2)).toFixed(1))
                : '-'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Blood Pressure:</span>
            <p className="font-medium">{formData.bloodPressure || '-'} mmHg</p>
          </div>
          <div>
            <span className="text-gray-600">Pulse:</span>
            <p className="font-medium">{formData.pulse || '-'} bpm</p>
          </div>
          <div>
            <span className="text-gray-600">Visual Acuity:</span>
            <p className="font-medium">{formData.visualAcuity || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600">Hearing Test:</span>
            <p className="font-medium">{formData.hearingTest || '-'}</p>
          </div>
        </div>
      </div>

      {/* Medical Declaration */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Medical Declaration (Past 6 Months)</h3>
        {checkedDeclarations.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-sm">
            {checkedDeclarations.map((item, index) => (
              <li key={index} className="text-amber-700">✓ {item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 italic">No conditions declared</p>
        )}
      </div>

      {/* Medical History */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Medical History</h3>
        {checkedHistoryItems.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-sm">
            {checkedHistoryItems.map((item, index) => (
              <li key={index} className="text-amber-700">✓ {item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 italic">No pre-existing conditions</p>
        )}
      </div>

      {/* LTA Vocational Assessment */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-lg mb-3">LTA Vocational Licence Assessment</h3>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-gray-600">Color Vision:</span>
              <p className="font-medium">{ltaVocational.colorVision || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Peripheral Vision:</span>
              <p className="font-medium">{ltaVocational.peripheralVision || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Night Vision:</span>
              <p className="font-medium">{ltaVocational.nightVision || '-'}</p>
            </div>
          </div>
          {(ltaVocational.cardiovascularCondition || ltaVocational.neurologicalCondition || 
            ltaVocational.psychiatricCondition || ltaVocational.musculoskeletalCondition) && (
            <div>
              <p className="font-medium text-gray-700 mb-2">Condition Assessments:</p>
              <div className="space-y-2 pl-4">
                {ltaVocational.cardiovascularCondition && (
                  <div>
                    <span className="text-gray-600">Cardiovascular:</span>
                    <p className="text-sm">{ltaVocational.cardiovascularCondition}</p>
                  </div>
                )}
                {ltaVocational.neurologicalCondition && (
                  <div>
                    <span className="text-gray-600">Neurological:</span>
                    <p className="text-sm">{ltaVocational.neurologicalCondition}</p>
                  </div>
                )}
                {ltaVocational.psychiatricCondition && (
                  <div>
                    <span className="text-gray-600">Psychiatric:</span>
                    <p className="text-sm">{ltaVocational.psychiatricCondition}</p>
                  </div>
                )}
                {ltaVocational.musculoskeletalCondition && (
                  <div>
                    <span className="text-gray-600">Musculoskeletal:</span>
                    <p className="text-sm">{ltaVocational.musculoskeletalCondition}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div>
            <span className="text-gray-600">Fit for Vocational Duty:</span>
            <p className={`font-bold text-lg ${ltaVocational.fitForVocationalDuty ? 'text-green-600' : 'text-red-600'}`}>
              {ltaVocational.fitForVocationalDuty ? '✓ YES' : '✗ NO'}
            </p>
          </div>
          {ltaVocational.restrictions && (
            <div>
              <span className="text-gray-600">Restrictions/Conditions:</span>
              <p className="font-medium whitespace-pre-wrap">{ltaVocational.restrictions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Assessment */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Medical Practitioner Assessment</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600">Fit for Vocational Duty:</span>
            <p className={`font-bold text-lg ${assessment.fitForVocationalDuty ? 'text-green-600' : 'text-red-600'}`}>
              {assessment.fitForVocationalDuty ? '✓ YES' : '✗ NO'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Requires Specialist Review:</span>
            <p className="font-medium">{assessment.requiresSpecialistReview ? 'Yes' : 'No'}</p>
          </div>
          {assessment.requiresSpecialistReview && assessment.specialistType && (
            <div>
              <span className="text-gray-600">Specialist Type:</span>
              <p className="font-medium">{assessment.specialistType}</p>
            </div>
          )}
          <div>
            <span className="text-gray-600">Remarks:</span>
            <p className="font-medium whitespace-pre-wrap">{assessment.remarks || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
