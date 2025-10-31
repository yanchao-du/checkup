import { cn } from '../ui/utils';

interface IcaExamDetailsProps {
  formData: Record<string, any>;
}

export function IcaExamDetails({ formData }: IcaExamDetailsProps) {
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
            <p className="text-sm text-slate-500 mb-1">Chest X-Ray to screen for TB</p>
            <p className={cn('text-slate-900', String(formData.chestXrayPositive) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.chestXrayPositive) === 'true'
                ? 'Positive/Reactive'
                : (formData.chestXray ?? 'Negative/Non-reactive')}
            </p>
          </div>
        </div>
      </div>

      {/* Remarks - always show, display '-' when empty */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Remarks</h4>
        <div className="bg-slate-50 p-3 rounded border border-slate-200">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{formData.remarks || '-'}</p>
        </div>
      </div>
    </div>
  );
}
