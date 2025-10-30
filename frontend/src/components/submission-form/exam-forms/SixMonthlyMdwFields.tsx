import { PregnancyTestField } from '../fields/PregnancyTestField';
import { ChestXrayField } from '../fields/ChestXrayField';
import { HeightField } from '../fields/HeightField';
import { WeightField } from '../fields/WeightField';
import { BmiField } from '../fields/BmiField';

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
  return (
    <div className="space-y-4">
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
