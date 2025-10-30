import { HeightField } from '../fields/HeightField';
import { WeightField } from '../fields/WeightField';
import { BmiField } from '../fields/BmiField';
import { CheckboxField } from '../fields/CheckboxField';
import { MdwRemarksField } from '../fields/MdwRemarksField';

interface SixMonthlyMdwFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
  lastRecordedHeight?: string;
  lastRecordedWeight?: string;
  lastRecordedDate?: string;
}

export function SixMonthlyMdwFields({ 
  formData, 
  onChange, 
  lastRecordedHeight, 
  lastRecordedWeight, 
  lastRecordedDate 
}: SixMonthlyMdwFieldsProps) {
  const handleCheckboxChange = (key: string, checked: boolean) => {
    onChange(key, checked ? 'true' : 'false');
  };

  const POSTIVE = 'Positive/Reactive';

  return (
    <div className="space-y-6">
      {/* Body Measurements */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Body Measurements</h3>
        <HeightField
          value={formData.height || ''}
          onChange={(value) => onChange('height', value)}
          lastRecordedHeight={lastRecordedHeight}
          lastRecordedDate={lastRecordedDate}
        />
        <WeightField
          value={formData.weight || ''}
          onChange={(value) => onChange('weight', value)}
          lastRecordedWeight={lastRecordedWeight}
          lastRecordedDate={lastRecordedDate}
        />
        <BmiField
          height={formData.height || ''}
          weight={formData.weight || ''}
        />
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Test Results</h3>
        <p className="text-sm text-slate-600">Indicate <b>postive</b> test results:</p>
        <div className="space-y-0 border border-slate-200 rounded-md p-4">
          <CheckboxField
            id="pregnancyTestPositive"
            label="Pregnancy test"
            checkboxLabel={POSTIVE}
            checked={formData.pregnancyTestPositive === 'true'}
            onChange={(checked) => handleCheckboxChange('pregnancyTestPositive', checked)}
          />
          <CheckboxField
            id="syphilisTestPositive"
            label="Syphilis test"
            checkboxLabel={POSTIVE}
            checked={formData.syphilisTestPositive === 'true'}
            onChange={(checked) => handleCheckboxChange('syphilisTestPositive', checked)}
          />
          <CheckboxField
            id="hivTestPositive"
            label="HIV test"
            checkboxLabel={POSTIVE}
            checked={formData.hivTestPositive === 'true'}
            onChange={(checked) => handleCheckboxChange('hivTestPositive', checked)}
          />
          <CheckboxField
            id="chestXrayPositive"
            label="Chest X-ray to screen for TB"
            checkboxLabel={POSTIVE}
            checked={formData.chestXrayPositive === 'true'}
            onChange={(checked) => handleCheckboxChange('chestXrayPositive', checked)}
            description='Note: HIV test must be done by an MOH-approved laboratory.'
          />
        </div>
      </div>

      {/* Physical Examination Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Physical Examination Details</h3>
        <div className="space-y-0 border border-slate-200 rounded-md p-4">
          <CheckboxField
            id="suspiciousInjuries"
            label="Signs of suspicious or unexplained injuries"
            checkboxLabel="Yes"
            checked={formData.suspiciousInjuries === 'true'}
            onChange={(checked) => handleCheckboxChange('suspiciousInjuries', checked)}
          />
          <CheckboxField
            id="unintentionalWeightLoss"
            label="Unintentional weight loss (if unsure, select yes)"
            checkboxLabel="Yes"
            checked={formData.unintentionalWeightLoss === 'true'}
            onChange={(checked) => handleCheckboxChange('unintentionalWeightLoss', checked)}
          />
        </div>
      </div>

      {/* Remarks */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Remarks</h3>
        <MdwRemarksField
          hasAdditionalRemarks={formData.hasAdditionalRemarks === 'true'}
          remarks={formData.remarks || ''}
          onHasAdditionalRemarksChange={(checked) => handleCheckboxChange('hasAdditionalRemarks', checked)}
          onRemarksChange={(value) => onChange('remarks', value)}
        />
      </div>
    </div>
  );
}
