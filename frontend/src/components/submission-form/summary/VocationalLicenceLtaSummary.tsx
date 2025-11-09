import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Edit } from 'lucide-react';
import type { UserClinic } from '../../../types/api';

interface VocationalLicenceLtaSummaryProps {
  formData: Record<string, any>;
  patientInfo: {
    name: string;
    nric: string;
    dateOfBirth?: string;
    email?: string;
    mobile?: string;
  };
  examinationDate: string;
  onEdit?: (section: string) => void;
  clinicInfo?: UserClinic;
  doctorName?: string;
  doctorMcrNumber?: string;
  userRole?: 'nurse' | 'doctor' | 'admin';
}

export function VocationalLicenceLtaSummary({
  formData,
  patientInfo,
  examinationDate,
  onEdit,
  clinicInfo,
  doctorName,
  doctorMcrNumber,
  userRole,
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
            <p className="font-medium">
              {formData.systolic && formData.diastolic 
                ? `${formData.systolic}/${formData.diastolic}` 
                : formData.bloodPressure || '-'} mmHg
            </p>
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
          <p className="text-sm text-gray-600 italic">No declared medical conditions</p>
        )}
      </div>

      {/* LTA Vocational Assessment */}
      <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-900">LTA Vocational Licence Assessment</h4>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600"
              onClick={() => onEdit('lta-vocational')}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
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
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
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

      {/* Doctor Information Display */}
      {doctorName && (
        <div className="pt-6 border-t border-gray-200">
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">{userRole === 'nurse' ? 'Prepared by' : 'Examining Doctor'}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24">Name:</span>
                <span className="text-gray-900">{doctorName}</span>
              </div>
              {doctorMcrNumber && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">MCR Number:</span>
                  <span className="text-gray-900">{doctorMcrNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clinic Information Display */}
      {clinicInfo && (
        <div className="pt-6 border-t border-gray-200">
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">Clinic</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-start">
                <span className="font-medium text-gray-700 w-24">Name:</span>
                <span className="text-gray-900">{clinicInfo.name}</span>
              </div>
              {clinicInfo.hciCode && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">HCI Code:</span>
                  <span className="text-gray-900">{clinicInfo.hciCode}</span>
                </div>
              )}
              {clinicInfo.phone && (
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Phone:</span>
                  <span className="text-gray-900">{clinicInfo.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Medical Practitioner Declaration */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-semibold mb-3">Medical Practitioner Declaration</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700 leading-relaxed">
            I certify that I have examined and identified the patient named above:
          </p>
          <ul className="mt-3 ml-6 space-y-2 text-sm text-gray-700 list-disc">
            <li>He/she has presented his/her identity card, which bears the same name and identification number as on this form.</li>
            <li>The answers to the questions above are correct to the best of my knowledge.</li>
          </ul>
        </div>
      </div>
        </CardContent>
      </Card>
    </div>
  );
}
