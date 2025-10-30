import { PregnancyTestField } from '../fields/PregnancyTestField';
import { ChestXrayField } from '../fields/ChestXrayField';
import { HeightField } from '../fields/HeightField';
import { WeightField } from '../fields/WeightField';

interface SixMonthlyMdwFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
}

export function SixMonthlyMdwFields({ formData, onChange }: SixMonthlyMdwFieldsProps) {
  return (
    <div className="space-y-4">
      <HeightField
        value={formData.height || ''}
        onChange={(value) => onChange('height', value)}
      />
      <WeightField
        value={formData.weight || ''}
        onChange={(value) => onChange('weight', value)}
      />
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
