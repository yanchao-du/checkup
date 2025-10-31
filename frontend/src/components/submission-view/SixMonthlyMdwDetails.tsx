import { cn } from '../ui/utils';
import { Separator } from '../ui/separator';

interface SixMonthlyMdwDetailsProps {
  formData: Record<string, any>;
}

export function SixMonthlyMdwDetails({ formData }: SixMonthlyMdwDetailsProps) {
  return (
    <>
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Test Results</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Pregnancy Test</p>
            <p className={cn('text-slate-900', String(formData.pregnancyTestPositive) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.pregnancyTestPositive) === 'true'
                ? 'Positive/Reactive'
                : (formData.pregnancyTest ?? 'Negative/Non-reactive')}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Syphilis Test</p>
            <p className={cn('text-slate-900', String(formData.syphilisTestPositive) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.syphilisTestPositive) === 'true'
                ? 'Positive/Reactive'
                : (formData.syphilisTest ?? 'Negative/Non-reactive')}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">HIV Test</p>
            <p className={cn('text-slate-900', String(formData.hivTestPositive) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.hivTestPositive) === 'true'
                ? 'Positive/Reactive'
                : (formData.hivTest ?? 'Negative/Non-reactive')}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Chest X-Ray</p>
            <p className={cn('text-slate-900', String(formData.chestXrayPositive) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.chestXrayPositive) === 'true'
                ? 'Positive/Reactive'
                : (formData.chestXray ?? 'Negative/Non-reactive')}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Physical Examination Details</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Signs of suspicious or unexplained injuries</p>
            <p className={cn('text-slate-900', String(formData.suspiciousInjuries) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.suspiciousInjuries) === 'true' ? 'Yes' : 'No'}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Unintentional weight loss</p>
            <p className={cn('text-slate-900', String(formData.unintentionalWeightLoss) === 'true' && 'font-semibold text-red-600')}>
              {String(formData.unintentionalWeightLoss) === 'true' ? 'Yes' : 'No'}
            </p>
          </div>

          {(formData.suspiciousInjuries === 'true' || formData.unintentionalWeightLoss === 'true') && (
            <div className="flex justify-between items-center pt-2 border-t">
              <p className="text-sm text-slate-500 font-medium">Police report made</p>
              <p className="text-slate-900 font-medium">
                {formData.policeReport === 'yes' ? 'Yes' : formData.policeReport === 'no' ? 'No' : '-'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
