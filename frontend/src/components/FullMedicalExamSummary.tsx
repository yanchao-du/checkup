import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FullMedicalExamSummaryProps {
  formData: any;
  gender?: string;
}

export function FullMedicalExamSummary({
  formData,
  gender,
}: FullMedicalExamSummaryProps) {
  const isFemale = gender === 'F';

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
    { key: 'hiv', label: 'HIV' },
    { key: 'pregnancy', label: 'Pregnancy', femaleOnly: true },
    { key: 'urineAlbumin', label: 'Urine Albumin' },
    { key: 'urineSugar', label: 'Urine Sugar' },
    { key: 'bloodPressure', label: 'Blood Pressure' },
    { key: 'malaria', label: 'Malaria' },
    { key: 'colourVision', label: 'Colour Vision' },
  ];

  const checkedHistoryConditions = medicalHistoryConditions.filter(
    (condition) => formData[`medicalHistory_${condition.key}`] === 'yes'
  );

  const abnormalTests = medicalTests.filter((test) => {
    if (test.femaleOnly && !isFemale) return false;
    return formData[`test_${test.key}`] === 'yes';
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
      {/* Medical History Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Medical History of Patient</CardTitle>
        </CardHeader>
        <CardContent>
          {checkedHistoryConditions.length > 0 ? (
            <div className="space-y-2">
              {checkedHistoryConditions.map((condition) => (
                <div key={condition.key} className="flex items-center gap-2">
                  <Badge variant="outline">{condition.label}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No medical history conditions reported</p>
          )}
        </CardContent>
      </Card>

      {/* Medical Examination Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Examination</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chest X-ray */}
          <div>
            <p className="text-sm font-medium mb-1">Chest X-ray:</p>
            <p className="text-sm">
              {formData.chestXray ? getChestXrayLabel(formData.chestXray) : 'Not specified'}
            </p>
          </div>

          {/* Syphilis */}
          <div>
            <p className="text-sm font-medium mb-1">Syphilis:</p>
            <p className="text-sm">
              {formData.syphilis ? getSyphilisLabel(formData.syphilis) : 'Not specified'}
            </p>
          </div>

          {/* Abnormal Tests */}
          <div>
            <p className="text-sm font-medium mb-1">Abnormal Tests:</p>
            {abnormalTests.length > 0 ? (
              <div className="space-y-2">
                {abnormalTests.map((test) => (
                  <div key={test.key} className="flex items-center gap-2">
                    <Badge variant="destructive">{test.label}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No abnormal tests</p>
            )}
          </div>

          {/* Other Abnormalities */}
          {formData.otherAbnormalities && (
            <div>
              <p className="text-sm font-medium mb-1">Other Abnormalities:</p>
              <p className="text-sm whitespace-pre-wrap">{formData.otherAbnormalities}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Fit for work:</p>
            {formData.fitForWork === 'yes' ? (
              <Badge className="bg-green-500">Yes</Badge>
            ) : formData.fitForWork === 'no' ? (
              <Badge variant="destructive">No</Badge>
            ) : (
              <p className="text-sm text-gray-500">Not specified</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
