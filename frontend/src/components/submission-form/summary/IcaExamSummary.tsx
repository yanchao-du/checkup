import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Edit } from 'lucide-react';

interface IcaExamSummaryProps {
  formData: Record<string, any>;
  patientName: string;
  patientNric: string;
  patientEmail?: string;
  examinationDate: string;
  onEdit: (section: string) => void;
}

export function IcaExamSummary({
  formData,
  patientName,
  patientNric,
  patientEmail,
  examinationDate,
  onEdit,
}: IcaExamSummaryProps) {
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
              <p className="font-medium">{patientName}</p>
            </div>
            <div>
              <p className="text-slate-500">NRIC/FIN</p>
              <p className="font-medium">{patientNric}</p>
            </div>
            <div>
              <p className="text-slate-500">Email Address</p>
              <p className="font-medium">{patientEmail || '-'}</p>
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
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Test Results</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">HIV test</span>
                <span className={formData.hivTestPositive === 'true' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                  {formData.hivTestPositive === 'true' ? 'Positive/Reactive' : 'Negative/Non-reactive'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">TB (Chest X-ray)</span>
                <span className={formData.chestXrayTb === 'yes' ? 'font-semibold text-red-600' : 'text-slate-500'}>
                  {formData.chestXrayTb === 'yes' ? 'Active TB detected' : formData.chestXrayTb === 'no' ? 'No active TB detected' : formData.chestXrayTb === 'pregnancy-exempted' ? 'Exempted due to pregnancy' : '-'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
