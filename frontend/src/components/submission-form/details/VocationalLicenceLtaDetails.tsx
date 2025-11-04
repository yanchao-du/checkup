import { MedicalSubmission } from '@/types/api';

interface VocationalLicenceLtaDetailsProps {
  submission: MedicalSubmission;
}

export function VocationalLicenceLtaDetails({ submission }: VocationalLicenceLtaDetailsProps) {
  const data = submission.formData as Record<string, any>;
  const medicalDeclaration = data.medicalDeclaration || {};
  const medicalHistory = data.medicalHistory || {};
  const ltaVocational = data.ltaVocational || {};
  const assessment = data.assessment || {};

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
      {/* General Medical Examination */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 text-blue-900 bg-blue-50 -mx-6 -mt-6 px-6 py-3 rounded-t-lg border-b-2 border-blue-200">General Medical Examination</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Height:</span>
            <p className="font-medium">{data.height || '-'} cm</p>
          </div>
          <div>
            <span className="text-gray-600">Weight:</span>
            <p className="font-medium">{data.weight || '-'} kg</p>
          </div>
          <div>
            <span className="text-gray-600">BMI:</span>
            <p className="font-medium">
              {data.height && data.weight
                ? ((data.weight / ((data.height / 100) ** 2)).toFixed(1))
                : '-'}
            </p>
          </div>
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
            <span className="text-gray-600">Visual Acuity:</span>
            <p className="font-medium">{data.visualAcuity || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600">Hearing Test:</span>
            <p className="font-medium">{data.hearingTest || '-'}</p>
          </div>
        </div>
      </div>

      {/* Medical Declaration */}
      <div className="bg-white border-2 border-amber-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-3 text-amber-900 bg-amber-50 -mx-6 -mt-6 px-6 py-3 rounded-t-lg border-b-2 border-amber-200">Medical Declaration (Past 6 Months)</h3>
        {checkedDeclarations.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {checkedDeclarations.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-amber-600 mr-2">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 italic">No conditions declared</p>
        )}
      </div>

      {/* Medical History */}
      <div className="bg-white border-2 border-amber-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-3 text-amber-900 bg-amber-50 -mx-6 -mt-6 px-6 py-3 rounded-t-lg border-b-2 border-amber-200">Medical History</h3>
        {checkedHistoryItems.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {checkedHistoryItems.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-amber-600 mr-2">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 italic">No pre-existing conditions</p>
        )}
      </div>

      {/* LTA Vocational Assessment */}
      <div className="bg-white border-2 border-indigo-200 rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg mb-0 text-indigo-900 bg-indigo-50 px-6 py-4 rounded-t-lg border-b-2 border-indigo-200">LTA Vocational Licence Assessment</h3>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
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
              <div className="space-y-3 pl-4">
                {ltaVocational.cardiovascularCondition && (
                  <div className="bg-white p-2 rounded border">
                    <span className="text-gray-600 text-sm font-medium">Cardiovascular:</span>
                    <p className="text-sm mt-1">{ltaVocational.cardiovascularCondition}</p>
                  </div>
                )}
                {ltaVocational.neurologicalCondition && (
                  <div className="bg-white p-2 rounded border">
                    <span className="text-gray-600 text-sm font-medium">Neurological:</span>
                    <p className="text-sm mt-1">{ltaVocational.neurologicalCondition}</p>
                  </div>
                )}
                {ltaVocational.psychiatricCondition && (
                  <div className="bg-white p-2 rounded border">
                    <span className="text-gray-600 text-sm font-medium">Psychiatric:</span>
                    <p className="text-sm mt-1">{ltaVocational.psychiatricCondition}</p>
                  </div>
                )}
                {ltaVocational.musculoskeletalCondition && (
                  <div className="bg-white p-2 rounded border">
                    <span className="text-gray-600 text-sm font-medium">Musculoskeletal:</span>
                    <p className="text-sm mt-1">{ltaVocational.musculoskeletalCondition}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div>
            <span className="text-gray-600">Fit for Vocational Duty:</span>
            <p className={`font-bold text-2xl ${ltaVocational.fitForVocationalDuty ? 'text-green-600' : 'text-red-600'}`}>
              {ltaVocational.fitForVocationalDuty ? '✓ YES' : '✗ NO'}
            </p>
          </div>
          {ltaVocational.restrictions && (
            <div>
              <span className="text-gray-600">Restrictions/Conditions:</span>
              <p className="font-medium whitespace-pre-wrap bg-white p-3 rounded border mt-1">
                {ltaVocational.restrictions}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Assessment */}
      <div className="bg-white border-2 border-green-300 rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg mb-0 text-green-900 bg-green-50 px-6 py-4 rounded-t-lg border-b-2 border-green-300">Medical Practitioner Assessment</h3>
        <div className="p-6 space-y-3 text-sm">
          <div>
            <span className="text-gray-600">Fit for Vocational Duty:</span>
            <p className={`font-bold text-2xl ${assessment.fitForVocationalDuty ? 'text-green-600' : 'text-red-600'}`}>
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
            <p className="font-medium whitespace-pre-wrap bg-white p-3 rounded border">
              {assessment.remarks || '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
