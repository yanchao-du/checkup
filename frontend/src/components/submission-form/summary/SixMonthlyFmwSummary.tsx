import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Edit } from 'lucide-react';
import { maskName } from '../../../lib/nameMasking';

interface SixMonthlyFmwSummaryProps {
  formData: Record<string, any>;
  patientName: string;
  patientNric: string;
  examinationDate: string;
  onEdit: (section: string) => void;
  requiredTests?: {
    pregnancy: boolean;
    syphilis: boolean;
    hiv: boolean;
    chestXray: boolean;
  };
}

export function SixMonthlyFmwSummary({
  formData,
  patientName,
  patientNric,
  examinationDate,
  onEdit,
  requiredTests,
}: SixMonthlyFmwSummaryProps) {
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
              <p className="text-slate-500">FIN</p>
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
              className="text-blue-600"
              onClick={() => onEdit('exam-specific')}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
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
