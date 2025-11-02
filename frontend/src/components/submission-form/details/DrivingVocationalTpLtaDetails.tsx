import { MedicalSubmission } from '@/types/api';

interface DrivingVocationalTpLtaDetailsProps {
  submission: MedicalSubmission;
}

export function DrivingVocationalTpLtaDetails({ submission }: DrivingVocationalTpLtaDetailsProps) {
  const data = submission.formData as Record<string, any>;
  const medicalDeclaration = data.medicalDeclaration || {};
  const medicalHistory = data.medicalHistory || {};
  const amt = data.amt || {};
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

  // Helper to get AMT question responses
  const getAmtResponses = () => {
    const questions: Record<string, string> = {
      age: 'Age',
      time: 'Time (to nearest hour)',
      address: 'Address for recall at end',
      year: 'Current year',
      place: 'Name of place',
      twoPersons: 'Recognition of two persons',
      dateOfBirth: 'Date of birth',
      yearWw1: 'Year World War 1 started',
      nameOfPm: 'Name of Prime Minister',
      countBackwards: 'Count backwards from 20 to 1',
    };

    const responses = [];
    for (const [key, label] of Object.entries(questions)) {
      if (amt[key] !== undefined) {
        responses.push({ question: label, passed: amt[key] });
      }
    }
    return responses;
  };

  const checkedDeclarations = getCheckedDeclarations();
  const checkedHistoryItems = getCheckedHistory();
  const amtResponses = getAmtResponses();

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

  const ageAtExamination = submission.patientDateOfBirth && submission.examinationDate
    ? calculateAge(submission.patientDateOfBirth, submission.examinationDate)
    : null;

  return (
    <div className="space-y-6">
      {/* Submission Metadata */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-lg mb-3">Submission Information</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Submission ID:</span>
            <p className="font-mono font-medium">{submission.id}</p>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <p className="font-medium capitalize">{submission.status}</p>
          </div>
          <div>
            <span className="text-gray-600">Submitted:</span>
            <p className="font-medium">{new Date(submission.createdDate).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Patient Information</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <p className="font-medium">{submission.patientName}</p>
          </div>
          <div>
            <span className="text-gray-600">NRIC/FIN:</span>
            <p className="font-medium">{submission.patientNric}</p>
          </div>
          {submission.patientDateOfBirth && (
            <div>
              <span className="text-gray-600">Date of Birth:</span>
              <p className="font-medium">{new Date(submission.patientDateOfBirth).toLocaleDateString()}</p>
            </div>
          )}
          {ageAtExamination !== null && (
            <div>
              <span className="text-gray-600">Age at Examination:</span>
              <p className="font-medium">{ageAtExamination} years</p>
            </div>
          )}
          {submission.examinationDate && (
            <div>
              <span className="text-gray-600">Examination Date:</span>
              <p className="font-medium">{new Date(submission.examinationDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

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
            <p className="font-medium">{data.bloodPressure || '-'} mmHg</p>
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

      {/* AMT Assessment */}
      <div className="bg-white border-2 border-purple-200 rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg mb-0 text-purple-900 bg-purple-50 px-6 py-4 rounded-t-lg border-b-2 border-purple-200">Abbreviated Mental Test (AMT)</h3>
        <div className="p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-4xl font-bold text-blue-700">{amt.score || 0}/10</p>
            </div>
            {amt.score < 8 && (
              <div className="bg-amber-100 border border-amber-300 rounded-md px-4 py-2">
                <p className="text-sm font-medium text-amber-800">
                  ⚠️ Low AMT score may indicate cognitive impairment
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Detailed Responses:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {amtResponses.map((response, index) => (
              <div key={index} className="flex items-center">
                <span className={`mr-2 ${response.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {response.passed ? '✓' : '✗'}
                </span>
                <span>{response.question}</span>
              </div>
            ))}
          </div>
        </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Fit to Drive (TP):</span>
              <p className={`font-bold text-2xl ${assessment.fitToDrive ? 'text-green-600' : 'text-red-600'}`}>
                {assessment.fitToDrive ? '✓ YES' : '✗ NO'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Fit for Vocational Duty (LTA):</span>
              <p className={`font-bold text-2xl ${assessment.fitForVocationalDuty ? 'text-green-600' : 'text-red-600'}`}>
                {assessment.fitForVocationalDuty ? '✓ YES' : '✗ NO'}
              </p>
            </div>
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
