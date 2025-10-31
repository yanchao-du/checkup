import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Edit } from 'lucide-react';

interface DrivingLicenceTpSummaryProps {
  formData: Record<string, any>;
  patientInfo: {
    name: string;
    nric: string;
    dateOfBirth?: string;
  };
  examinationDate: string;
  onEdit?: (section: string) => void;
}

export function DrivingLicenceTpSummary({
  formData,
  patientInfo,
  examinationDate,
  onEdit,
}: DrivingLicenceTpSummaryProps) {
  const medicalDeclaration = formData.medicalDeclaration || {};
  const medicalHistory = formData.medicalHistory || {};
  const amt = formData.amt || {};
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

      {/* Assessment */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-900">Medical Practitioner Assessment</h4>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600"
              onClick={() => onEdit('assessment')}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600">Fit to Drive:</span>
            <p className={`font-bold text-lg ${assessment.fitToDrive ? 'text-green-600' : 'text-red-600'}`}>
              {assessment.fitToDrive ? '✓ YES' : '✗ NO'}
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
        </CardContent>
      </Card>
    </div>
  );
}
