import { PregnancyTestField } from '../fields/PregnancyTestField';
import { ChestXrayField } from '../fields/ChestXrayField';

interface SixMonthlyMdwFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
}

export function SixMonthlyMdwFields({ formData, onChange }: SixMonthlyMdwFieldsProps) {
  return (
    <div className="space-y-4">
      <PregnancyTestField
        value={formData.pregnancyTest || ''}
        onChange={(value) => onChange('pregnancyTest', value)}
      />
      <ChestXrayField
        value={formData.chestXray || ''}
        onChange={(value) => onChange('chestXray', value)}
      />
    </div>
  );
}
