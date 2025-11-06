import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { maskName } from '../lib/nameMasking';

interface FullMedicalExamSummaryProps {
  formData: any;
  gender?: string;
  onEdit?: (section: string) => void;
  patientName: string;
  patientNric: string;
  examinationDate: string;
}

export function FullMedicalExamSummary({
  formData,
  gender,
  onEdit,
  patientName,
  patientNric,
  examinationDate,
}: FullMedicalExamSummaryProps) {
  const isFemale = gender === 'F';

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const medicalHistoryConditions = [
    { key: 'cardiovascular', label: 'Cardiovascular disease' },
    { key: 'metabolic', label: 'Metabolic disease' },
    { key: 'respiratory', label: 'Respiratory disease' },
    { key: 'gastrointestinal', label: 'Gastrointestinal disease' },
    { key: 'neurological', label: 'Neurological disease' },
    { key: 'mentalHealth', label: 'Mental health condition' },
    { key: 'otherMedical', label: 'Other medical condition' },
    { key: 'previousSurgeries', label: 'Previous surgeries' },
    { key: 'longTermMedications', label: 'Long-term medications' },
    { key: 'smokingHistory', label: 'Smoking History' },
    { key: 'lifestyleRiskFactors', label: 'Lifestyle risk factors' },
    { key: 'previousInfections', label: 'Previous infections' },
  ];

  const medicalTests = [
    { key: 'hiv', label: 'HIV', checkboxLabel: 'Positive', normalLabel: 'Negative' },
    { key: 'pregnancy', label: 'Pregnancy', femaleOnly: true, checkboxLabel: 'Positive', normalLabel: 'Negative' },
    { key: 'urineAlbumin', label: 'Urine Albumin', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
    { key: 'urineSugar', label: 'Urine Sugar', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
    { key: 'bloodPressure', label: 'Blood Pressure', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
    { key: 'malaria', label: 'Malaria', checkboxLabel: 'Positive', normalLabel: 'Negative' },
    { key: 'colourVision', label: 'Colour Vision', checkboxLabel: 'Abnormal', normalLabel: 'Normal' },
  ];

  const checkedHistoryConditions = medicalHistoryConditions.filter(
    (condition) => formData[`medicalHistory_${condition.key}`] === 'yes'
  );

  // Get all relevant tests (including female-specific)
  const relevantTests = medicalTests.filter((test) => {
    if (test.femaleOnly && !isFemale) return false;
    return true;
  });

  const getChestXrayLabel = (value: string) => {
    const labels: Record<string, string> = {
      'normal': 'Normal',
      'no-referral': 'No referral needed',
      'cleared-ntbcc': 'Cleared by NTBCC',
      'pregnancy-exempted': 'Pregnancy Exempted',
    };
    return labels[value] || value;
  };

  const getSyphilisLabel = (value: string) => {
    const labels: Record<string, string> = {
      'normal': 'Normal',
      'positive-infectious': 'Positive - Currently Infectious',
      'positive-treated': 'Positive - Treated Inactive',
    };
    return labels[value] || value;
  };

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
              <p className="font-medium">{maskName(patientName)}</p>
            </div>
            <div>
              <p className="text-slate-500">NRIC/FIN</p>
              <p className="font-medium">{patientNric}</p>
            </div>
            <div>
              <p className="text-slate-500">Gender</p>
              <p className="font-medium">{formData.gender === 'M' ? 'Male' : formData.gender === 'F' ? 'Female' : '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Examination Date</p>
              <p className="font-medium">{formatDate(examinationDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History Summary */}
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
          {checkedHistoryConditions.length > 0 ? (
            <ul className="list-disc ml-6 space-y-3 text-sm">
              {checkedHistoryConditions.map((condition) => (
                <li key={condition.key} className="text-amber-700">
                  <div>
                    <div className="font-medium">{condition.label}</div>
                    {formData[`medicalHistory_${condition.key}Remarks`] && (
                      <div className="mt-1 ml-0 text-gray-700 bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                        <span className="font-semibold">Remarks: </span>
                        {formData[`medicalHistory_${condition.key}Remarks`]}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600 italic">No medical history conditions reported</p>
          )}
          
          {/* Patient Certification */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Declaration by Patient to Medical Practitioner</h4>
            <div className={`p-3 rounded-md ${formData.medicalHistory_patientCertification ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              {formData.medicalHistory_patientCertification ? (
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

      {/* Medical Examination Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Medical Examination</h3>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600"
                onClick={() => onEdit('medical-examination')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="space-y-6">
          {/* Test Results */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Test Results</h4>
            <div className="space-y-2 text-sm">
              {/* Chest X-ray */}
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Chest X-ray</span>
                <span className={
                  formData.chestXray && formData.chestXray !== 'normal' 
                    ? 'font-semibold text-red-600' 
                    : 'text-slate-500'
                }>
                  {formData.chestXray ? getChestXrayLabel(formData.chestXray) : 'Not specified'}
                </span>
              </div>

              {/* Syphilis */}
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Syphilis</span>
                <span className={
                  formData.syphilis === 'positive-infectious' 
                    ? 'font-semibold text-red-600' 
                    : formData.syphilis === 'positive-treated'
                    ? 'font-semibold text-amber-600'
                    : 'text-slate-500'
                }>
                  {formData.syphilis ? getSyphilisLabel(formData.syphilis) : 'Not specified'}
                </span>
              </div>

              {/* All Other Tests */}
              {relevantTests.map((test) => {
                const isAbnormal = formData[`test_${test.key}`] === 'yes';
                return (
                  <div key={test.key} className="flex justify-between items-center">
                    <span className="text-slate-700">{test.label}</span>
                    <span className={isAbnormal ? 'font-semibold text-red-600' : 'text-slate-500'}>
                      {isAbnormal ? test.checkboxLabel : test.normalLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Other Abnormalities */}
          {formData.otherAbnormalities && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Other Abnormalities</h4>
              <div className="text-sm bg-slate-50 p-3 rounded-md">
                <p className="text-slate-700 whitespace-pre-wrap">{formData.otherAbnormalities}</p>
              </div>
            </div>
          )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
