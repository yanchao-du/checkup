import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Edit } from 'lucide-react';

interface DrivingLicenceTpSummaryProps {
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

export function DrivingLicenceTpSummary({
  formData,
  patientInfo,
  examinationDate,
  onEdit,
  onChange,
}: DrivingLicenceTpSummaryProps) {
  const medicalDeclaration = formData.medicalDeclaration || {};
  const medicalHistory = formData.medicalHistory || {};
  const amt = formData.amt || {};
  const assessment = formData.assessment || {};
  const abnormalityChecklist = formData.abnormalityChecklist || {};

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

  // Helper to get abnormalities
  const getAbnormalities = () => {
    const items: string[] = [];
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
      if (abnormalityChecklist[key]?.checked) {
        const remarks = abnormalityChecklist[key]?.remarks;
        items.push(remarks ? `${label}: ${remarks}` : label);
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

      {/* Examination Details */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Examination Details</h3>

          {/* General Medical Examination */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h4 className="text-sm font-semibold text-slate-900">General Medical Examination</h4>
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
        
        {/* Abnormality Checklist */}
        {abnormalities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-semibold text-gray-900 mb-2">Physical & Mental Abnormalities Observed</h5>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {abnormalities.map((item, index) => (
                <li key={index} className="text-red-700">⚠ {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Medical Declaration */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 border-b pb-2">
          <h4 className="text-sm font-semibold text-slate-900">Medical Declaration (Past 6 Months)</h4>
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 border-b pb-2">
          <h4 className="text-sm font-semibold text-slate-900">Medical History</h4>
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
          <ul className="list-disc list-inside space-y-1 text-sm">
            {checkedHistoryItems.map((item, index) => (
              <li key={index} className="text-amber-700">✓ {item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 italic">No pre-existing conditions</p>
        )}
      </div>

      {/* AMT Score */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-900">Abbreviated Mental Test (AMT)</h4>
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Score</p>
            <p className="text-3xl font-bold text-blue-700">{amt.score || 0}/10</p>
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

      {/* Overall Result of Medical Examination */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h4 className="text-base font-semibold text-slate-900 mb-4">Overall Result of Medical Examination</h4>
        
        {/* Fit to Drive Question */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Is the patient physically and mentally fit to drive a motor vehicle? <span className="text-red-500">*</span>
          </p>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="fitToDrive"
                value="true"
                checked={assessment.fitToDrive === true}
                onChange={() => {
                  if (onChange) {
                    onChange('assessment', { ...assessment, fitToDrive: true });
                  }
                }}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium">Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="fitToDrive"
                value="false"
                checked={assessment.fitToDrive === false}
                onChange={() => {
                  if (onChange) {
                    onChange('assessment', { ...assessment, fitToDrive: false });
                  }
                }}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium">No</span>
            </label>
          </div>
          {assessment.fitToDrive !== undefined && (
            <div className="mt-3">
              <p className={`font-bold text-lg ${assessment.fitToDrive ? 'text-green-600' : 'text-red-600'}`}>
                {assessment.fitToDrive ? '✓ YES - Patient is fit to drive' : '✗ NO - Patient is not fit to drive'}
              </p>
            </div>
          )}
        </div>

        {/* Medical Practitioner Declaration */}
        <div className="pt-4 border-t border-blue-200">
          <h5 className="font-semibold mb-3 text-gray-900">Medical Practitioner Declaration</h5>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            I certify that I have today examined and identified the patient named above:
          </p>
          <ul className="ml-6 mb-4 space-y-2 text-sm text-gray-700 list-disc">
            <li>He/she has presented his/her identity card, which bears the same name and identification number as on this form.</li>
            <li>The answers to the questions above are correct to the best of my knowledge.</li>
          </ul>
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
            <span className="text-sm font-medium text-gray-900">
              I agree to the above declaration <span className="text-red-500">*</span>
            </span>
          </label>
        </div>
      </div>
        </CardContent>
      </Card>
    </div>
  );
}
