import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Edit } from 'lucide-react';
import { maskName } from '../../../lib/nameMasking';
import type { UserClinic } from '../../../types/api';

interface SixMonthlyMdwSummaryProps {
  formData: Record<string, any>;
  patientName: string;
  patientNric: string;
  examinationDate: string;
  lastRecordedHeight?: string;
  lastRecordedWeight?: string;
  lastRecordedDate?: string;
  onEdit: (section: string) => void;
  clinicInfo?: UserClinic;
  requiredTests?: {
    pregnancy: boolean;
    syphilis: boolean;
    hiv: boolean;
    chestXray: boolean;
  };
}

export function SixMonthlyMdwSummary({
  formData,
  patientName,
  patientNric,
  examinationDate,
  lastRecordedHeight,
  lastRecordedWeight,
  lastRecordedDate,
  clinicInfo,
  onEdit,
  requiredTests,
}: SixMonthlyMdwSummaryProps) {
  // Extract required tests from formData if not provided as prop
  const tests = requiredTests || {
    pregnancy: true,
    syphilis: true,
    hiv: formData.hivTestRequired === 'true',
    chestXray: formData.chestXrayRequired === 'true',
  };
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
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

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
              className="text-blue-600"
              onClick={() => onEdit('patient-info')}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
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
              <p className="text-slate-500">Examination Date</p>
              <p className="font-medium">{formatDate(examinationDate)}</p>
            </div>
            {clinicInfo && (
              <div className="col-span-2">
                <p className="text-slate-500">Clinic</p>
                <p className="font-medium">{clinicInfo.name}</p>
                {(clinicInfo.hciCode || clinicInfo.phone) && (
                  <p className="text-xs text-slate-600 mt-1">
                    {[clinicInfo.hciCode, clinicInfo.phone].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>
            )}
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
              className="text-blue-600"
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
                  {bmi ? (
                    <>
                      <span>{bmi}</span>
                      <span className=" text-slate-500"> - </span>
                      <span className={bmiCategory === 'Underweight' || bmiCategory === 'Obese' ? 'text-red-600' : 'text-slate-700'}>
                        {bmiCategory}
                      </span>
                    </>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Test Results</h4>
            <div className="space-y-2 text-sm">
              {tests.pregnancy && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Pregnancy test</span>
                  <span className={formData.pregnancyTestPositive === 'true' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                    {formData.pregnancyTestPositive === 'true' ? 'Positive/Reactive' : 'Negative/Non-reactive'}
                  </span>
                </div>
              )}
              {tests.syphilis && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Syphilis test</span>
                  <span className={formData.syphilisTestPositive === 'true' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                    {formData.syphilisTestPositive === 'true' ? 'Positive/Reactive' : 'Negative/Non-reactive'}
                  </span>
                </div>
              )}
              {tests.hiv && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">HIV test</span>
                  <span className={formData.hivTestPositive === 'true' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                    {formData.hivTestPositive === 'true' ? 'Positive/Reactive' : 'Negative/Non-reactive'}
                  </span>
                </div>
              )}
              {tests.chestXray && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Chest X-ray to screen for TB</span>
                  <span className={formData.chestXrayPositive === 'true' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                    {formData.chestXrayPositive === 'true' ? 'Positive/Reactive' : 'Negative/Non-reactive'}
                  </span>
                </div>
              )}
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

          {/* Remarks - always show, display '-' when empty */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Remarks</h4>
            <div className="text-sm bg-slate-50 p-3 rounded-md">
              <p className="text-slate-700 whitespace-pre-wrap">{formData.remarks ? formData.remarks : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
