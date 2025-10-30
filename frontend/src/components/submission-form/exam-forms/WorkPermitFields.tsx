import { HivTestField } from '../fields/HivTestField';
import { TbTestField } from '../fields/TbTestField';
import { HeightField } from '../fields/HeightField';
import { WeightField } from '../fields/WeightField';
import { BloodPressureField } from '../fields/BloodPressureField';

interface WorkPermitFieldsProps {
  formData: Record<string, any>;
  onChange: (key: string, value: string) => void;
}

export function WorkPermitFields({ 
  formData, 
  onChange
}: WorkPermitFieldsProps) {
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
      <BloodPressureField
        systolic={formData.systolic || ''}
        diastolic={formData.diastolic || ''}
        onSystolicChange={(value) => onChange('systolic', value)}
        onDiastolicChange={(value) => onChange('diastolic', value)}
      />
      <HivTestField
        value={formData.hivTest || ''}
        onChange={(value) => onChange('hivTest', value)}
      />
      <TbTestField
        value={formData.tbTest || ''}
        onChange={(value) => onChange('tbTest', value)}
      />
    </div>
  );
}
