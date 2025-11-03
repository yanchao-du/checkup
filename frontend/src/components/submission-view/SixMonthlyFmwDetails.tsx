import { cn } from '../ui/utils';
import { MedicalSubmission } from '@/types/api';

interface SixMonthlyFmwDetailsProps {
  submission: MedicalSubmission;
}

export function SixMonthlyFmwDetails({ submission }: SixMonthlyFmwDetailsProps) {
  const formData = submission.formData as Record<string, any>;
  
  // Extract required tests from formData
  const tests = {
    pregnancy: true, // Always required for FMW
    syphilis: true,  // Always required for FMW
    hiv: formData.hivTestRequired === 'true',
    chestXray: formData.chestXrayRequired === 'true',
  };

  return (
    <>
      {/* Submission Reference */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
        <h3 className="font-semibold text-lg mb-3">Submission Reference</h3>
        <div className="text-sm">
          <span className="text-gray-600">Reference Number:</span>
          <p className="font-mono font-medium text-lg">{submission.id}</p>
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold text-lg mb-3">Patient Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <p className="font-medium">{submission.patientName}</p>
          </div>
          <div>
            <span className="text-gray-600">NRIC/FIN:</span>
            <p className="font-medium">{submission.patientNric}</p>
          </div>
          {submission.examinationDate && (
            <div>
              <span className="text-gray-600">Examination Date:</span>
              <p className="font-medium">{new Date(submission.examinationDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      <div>
      <h4 className="text-sm font-semibold text-slate-900 mb-3">Test Results</h4>
      <div className="grid grid-cols-2 gap-4">
        {tests.pregnancy && (
          <div>
            <p className="text-sm text-slate-500 mb-1">Pregnancy Test</p>
            <p className={cn('text-slate-900', String(formData.pregnancyTestPositive) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.pregnancyTestPositive) === 'true'
                ? 'Positive/Reactive'
                : (formData.pregnancyTest ?? 'Negative/Non-reactive')}
            </p>
          </div>
        )}

        {tests.syphilis && (
          <div>
            <p className="text-sm text-slate-500 mb-1">Syphilis Test</p>
            <p className={cn('text-slate-900', String(formData.syphilisTestPositive) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.syphilisTestPositive) === 'true'
                ? 'Positive/Reactive'
                : (formData.syphilisTest ?? 'Negative/Non-reactive')}
            </p>
          </div>
        )}

        {tests.hiv && (
          <div>
            <p className="text-sm text-slate-500 mb-1">HIV Test</p>
            <p className={cn('text-slate-900', String(formData.hivTestPositive) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.hivTestPositive) === 'true'
                ? 'Positive/Reactive'
                : (formData.hivTest ?? 'Negative/Non-reactive')}
            </p>
          </div>
        )}

        {tests.chestXray && (
          <div>
            <p className="text-sm text-slate-500 mb-1">Chest X-Ray</p>
            <p className={cn('text-slate-900', String(formData.chestXrayPositive) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.chestXrayPositive) === 'true'
                ? 'Positive/Reactive'
                : (formData.chestXray ?? 'Negative/Non-reactive')}
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
