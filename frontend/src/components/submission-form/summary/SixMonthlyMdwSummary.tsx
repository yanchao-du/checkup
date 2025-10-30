import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Edit } from 'lucide-react';

interface SixMonthlyMdwSummaryProps {
  formData: Record<string, any>;
  patientName: string;
  patientNric: string;
  examinationDate: string;
  lastRecordedHeight?: string;
  lastRecordedWeight?: string;
  lastRecordedDate?: string;
  onEdit: (section: string) => void;
}

export function SixMonthlyMdwSummary({
  formData,
  patientName,
  patientNric,
  examinationDate,
  lastRecordedHeight,
  lastRecordedWeight,
  lastRecordedDate,
  onEdit,
}: SixMonthlyMdwSummaryProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateBMI = () => {
    if (!formData.height || !formData.weight) return null;
    const heightInMeters = parseFloat(formData.height) / 100;
    const weightInKg = parseFloat(formData.weight);
    if (isNaN(heightInMeters) || isNaN(weightInKg) || heightInMeters === 0) return null;
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 23) return 'Normal';
    if (bmi < 27.5) return 'Overweight';
    return 'Obese';
  };

  const bmi = calculateBMI();

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Patient Information</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit('patient-info')}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Patient Name</p>
              <p className="font-medium">{patientName}</p>
            </div>
            <div>
              <p className="text-slate-500">NRIC/FIN</p>
              <p className="font-medium">{patientNric}</p>
            </div>
            <div>
              <p className="text-slate-500">Examination Date</p>
              <p className="font-medium">{formatDate(examinationDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Examination Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Examination Details</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit('exam-specific')}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Body Measurements */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Body Measurements</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Height</p>
                <p className="font-medium">{formData.height ? `${formData.height} cm` : '-'}</p>
                {lastRecordedHeight && lastRecordedDate && (
                  <p className="text-xs text-slate-400">Last: {lastRecordedHeight} cm ({formatDate(lastRecordedDate)})</p>
                )}
              </div>
              <div>
                <p className="text-slate-500">Weight</p>
                <p className="font-medium">{formData.weight ? `${formData.weight} kg` : '-'}</p>
                {lastRecordedWeight && lastRecordedDate && (
                  <p className="text-xs text-slate-400">Last: {lastRecordedWeight} kg ({formatDate(lastRecordedDate)})</p>
                )}
              </div>
              <div>
                <p className="text-slate-500">BMI</p>
                <p className="font-medium">
                  {bmi ? `${bmi} (${getBMICategory(parseFloat(bmi))})` : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Test Results</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Pregnancy test</span>
                <span className={formData.pregnancyTestPositive === 'true' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                  {formData.pregnancyTestPositive === 'true' ? 'Positive' : 'Negative'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Syphilis test</span>
                <span className={formData.syphilisTestPositive === 'true' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                  {formData.syphilisTestPositive === 'true' ? 'Reactive' : 'Non-reactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">HIV test</span>
                <span className={formData.hivTestPositive === 'true' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                  {formData.hivTestPositive === 'true' ? 'Reactive' : 'Non-reactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Chest X-ray to screen for TB</span>
                <span className={formData.chestXrayPositive === 'true' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                  {formData.chestXrayPositive === 'true' ? 'Positive' : 'Negative'}
                </span>
              </div>
            </div>
          </div>

          {/* Physical Examination Details */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Physical Examination Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Signs of suspicious or unexplained injuries</span>
                <span className={formData.suspiciousInjuries === 'true' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                  {formData.suspiciousInjuries === 'true' ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Unintentional weight loss</span>
                <span className={formData.unintentionalWeightLoss === 'true' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                  {formData.unintentionalWeightLoss === 'true' ? 'Yes' : 'No'}
                </span>
              </div>
              {(formData.suspiciousInjuries === 'true' || formData.unintentionalWeightLoss === 'true') && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-slate-700 font-medium">Police report made</span>
                  <span className="font-medium">
                    {formData.policeReport === 'yes' ? 'Yes' : formData.policeReport === 'no' ? 'No' : '-'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Remarks */}
          {formData.remarks && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Remarks</h4>
              <div className="text-sm bg-slate-50 p-3 rounded-md">
                <p className="text-slate-700 whitespace-pre-wrap">{formData.remarks}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
