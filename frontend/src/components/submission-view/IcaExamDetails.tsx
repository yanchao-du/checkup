import { cn } from '../ui/utils';
import { MedicalSubmission } from '@/types/api';

interface IcaExamDetailsProps {
  submission: MedicalSubmission;
}

export function IcaExamDetails({ submission }: IcaExamDetailsProps) {
  const formData = submission.formData as Record<string, any>;
  
  return (
    <div className="space-y-6">
      {/* Test Results */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Test Results</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">HIV Test</p>
            <p className={cn('text-slate-900', String(formData.hivTestPositive) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.hivTestPositive) === 'true'
                ? 'Positive/Reactive'
                : (formData.hivTest ?? 'Negative/Non-reactive')}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">TB (Chest X-ray)</p>
            <p className={cn('text-slate-900', formData.chestXrayTb === 'yes' && 'font-semibold text-red-600')}>
              {formData.chestXrayTb === 'yes' ? 'Active TB detected' : formData.chestXrayTb === 'no' ? 'No active TB detected' : formData.chestXrayTb === 'pregnancy-exempted' ? 'Exempted due to pregnancy' : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
