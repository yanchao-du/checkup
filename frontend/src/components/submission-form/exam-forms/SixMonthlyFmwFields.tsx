import { CheckboxField } from '../fields/CheckboxField';
import { MdwRemarksField } from '../fields/MdwRemarksField';

interface SixMonthlyFmwFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
  remarksError?: string | null;
  setRemarksError?: (err: string | null) => void;
}

export function SixMonthlyFmwFields({ 
  formData, 
  onChange,
  remarksError,
  setRemarksError,
}: SixMonthlyFmwFieldsProps) {
  const handleCheckboxChange = (key: string, checked: boolean) => {
    onChange(key, checked ? 'true' : 'false');
  };

  const POSITIVE = 'Positive/Reactive';

  return (
    <div className="space-y-6">
      {/* Test Results */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Test Results</h3>
        <p className="text-sm text-slate-600">Indicate <b>positive</b> test results:</p>
        <div className="space-y-0 border border-slate-200 rounded-md p-4">
          <CheckboxField
            id="pregnancyTestPositive"
            label="Pregnancy test"
            checkboxLabel={POSITIVE}
            checked={formData.pregnancyTestPositive === 'true'}
            onChange={(checked) => handleCheckboxChange('pregnancyTestPositive', checked)}
          />
          <CheckboxField
            id="syphilisTestPositive"
            label="Syphilis test"
            checkboxLabel={POSITIVE}
            checked={formData.syphilisTestPositive === 'true'}
            onChange={(checked) => handleCheckboxChange('syphilisTestPositive', checked)}
          />
          <CheckboxField
            id="hivTestPositive"
            label="HIV test"
            checkboxLabel={POSITIVE}
            checked={formData.hivTestPositive === 'true'}
            onChange={(checked) => handleCheckboxChange('hivTestPositive', checked)}
          />
          <CheckboxField
            id="chestXrayPositive"
            label="Chest X-ray to screen for TB"
            checkboxLabel={POSITIVE}
            checked={formData.chestXrayPositive === 'true'}
            onChange={(checked) => handleCheckboxChange('chestXrayPositive', checked)}
            description='Note: HIV test must be done by an MOH-approved laboratory.'
          />
        </div>
      </div>

      {/* Remarks */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Remarks</h3>
        <MdwRemarksField
          hasAdditionalRemarks={formData.hasAdditionalRemarks === 'true'}
          remarks={formData.remarks || ''}
          onHasAdditionalRemarksChange={(checked) => {
            handleCheckboxChange('hasAdditionalRemarks', checked);
            if (!checked) {
              onChange('remarks', '');
              if (setRemarksError) setRemarksError(null);
            }
          }}
          onRemarksChange={(value) => {
            onChange('remarks', value);
            if (setRemarksError) setRemarksError(null);
          }}
          externalError={remarksError}
        />
      </div>
    </div>
  );
}
