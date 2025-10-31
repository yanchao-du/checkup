import { cn } from '../ui/utils';

interface SixMonthlyFmwDetailsProps {
  formData: Record<string, any>;
}

export function SixMonthlyFmwDetails({ formData }: SixMonthlyFmwDetailsProps) {
  // Extract required tests from formData
  const tests = {
    pregnancy: true, // Always required for FMW
    syphilis: true,  // Always required for FMW
    hiv: formData.hivTestRequired === 'true',
    chestXray: formData.chestXrayRequired === 'true',
  };

  return (
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
  );
}
